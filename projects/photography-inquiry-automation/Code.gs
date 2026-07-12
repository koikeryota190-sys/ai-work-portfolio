/**
 * 出張撮影サービス向け・問い合わせ受付自動化システム
 * Google Forms / Google Sheets / Google Apps Script / MailApp
 */

const APP = Object.freeze({
  INQUIRY_SHEET: '問い合わせ一覧',
  CONFIG_SHEET: '設定',
  TEST_SHEET: 'テスト結果',
  RAW_RESPONSE_SHEET: 'フォーム回答（原本）',
  FORM_TITLE: 'Sunny Day Photo｜出張撮影お問い合わせ',
  FORM_DESCRIPTION:
    '出張撮影に関するお問い合わせフォームです。内容を確認後、担当者よりご連絡します。',
  SERVICES: ['個人プロフィール撮影', '家族・記念撮影', 'イベント撮影'],
  QUESTION: Object.freeze({
    NAME: '名前',
    EMAIL: 'メールアドレス',
    SERVICE: '希望サービス',
    DATE: '希望日',
    MESSAGE: '問い合わせ内容',
  }),
  COL: Object.freeze({
    RECEIVED_AT: 1,
    INQUIRY_ID: 2,
    NAME: 3,
    EMAIL: 4,
    SERVICE: 5,
    PREFERRED_DATE: 6,
    MESSAGE: 7,
    STATUS: 8,
    REPLY_STATUS: 9,
    ERROR: 10,
    ADMIN_NOTICE_STATUS: 11,
    PROCESSING_KEY: 12,
  }),
});

/**
 * 初回だけ手動実行する。
 * フォームの作成、回答先の接続、フォーム送信トリガーの登録を行う。
 *
 * @return {{formUrl: string, editUrl: string, spreadsheetUrl: string}}
 */
function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('対象スプレッドシートの「拡張機能」からApps Scriptを開いて実行してください。');
  }
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  const config = getConfig_(ss);
  ensureInquirySheet_(ss);

  let form = openConfiguredForm_(config);
  if (!form) {
    form = createInquiryForm_();
    // 後続処理が失敗しても、再実行時に同じフォームを再利用できるよう先に保存する。
    saveRuntimeConfig_(ss, form);
  }

  let hasExpectedDestination = false;
  try {
    // 回答先が未設定の新規フォームではgetDestinationId()が例外になる。
    hasExpectedDestination = form.getDestinationId() === ss.getId();
  } catch (error) {
    hasExpectedDestination = false;
  }
  if (!hasExpectedDestination) {
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  }

  installFormSubmitTrigger_(form);
  saveRuntimeConfig_(ss, form);
  renameAndHideRawResponseSheet_(ss);

  const result = {
    formUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    spreadsheetUrl: ss.getUrl(),
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Googleフォームのインストール型「フォーム送信時」トリガーから実行される。
 * 手動実行はしない。
 *
 * @param {GoogleAppsScript.Events.FormsOnFormSubmit} e
 */
function onFormSubmit(e) {
  if (!e || !e.response) {
    throw new Error('フォーム送信イベントから実行してください。手動実行はできません。');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const response = e.response;
    const responseId = response.getId();
    if (!responseId) {
      throw new Error('フォーム回答IDを取得できませんでした。');
    }

    const processingKey = `FORM_RESPONSE:${responseId}`;
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName(APP.INQUIRY_SHEET);
    if (!sheet) {
      throw new Error(`管理シート「${APP.INQUIRY_SHEET}」が見つかりません。`);
    }

    const existingRow = findRowByProcessingKey_(sheet, processingKey);
    if (existingRow) {
      console.log(`処理済みの回答をスキップしました: ${processingKey}`);
      return;
    }

    const config = getConfig_(ss);
    const payload = responseToPayload_(response);
    validatePayload_(payload);

    const inquiryId = issueInquiryId_(sheet, config.inquiryPrefix, payload.receivedAt);
    const rowNumber = appendInitialRecord_(sheet, payload, inquiryId, processingKey);

    sendAndRecordEmails_(sheet, rowNumber, payload, inquiryId, config, ss.getUrl());
  } catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    throw error;
  } finally {
    lock.releaseLock();
  }
}

/**
 * フォーム、トリガー、管理シート、設定値を読み取り専用で点検する。
 * メール送信や問い合わせ行の追加は行わない。
 *
 * @return {Object}
 */
function runSelfCheck() {
  const ss = getSpreadsheet_();
  const config = getConfig_(ss);
  const inquirySheet = ss.getSheetByName(APP.INQUIRY_SHEET);
  const checks = [];

  checks.push(check_('管理シートが存在する', Boolean(inquirySheet)));
  checks.push(
    check_(
      '管理シートの見出しが12列ある',
      Boolean(inquirySheet) && inquirySheet.getRange(1, 1, 1, 12).getValues()[0].filter(String).length === 12,
    ),
  );
  checks.push(check_('運営者通知先が設定されている', isValidEmail_(config.adminEmail)));
  checks.push(check_('問い合わせ番号接頭辞が設定されている', Boolean(config.inquiryPrefix)));

  const form = openConfiguredForm_(config);
  checks.push(check_('Googleフォームが作成済み', Boolean(form)));
  checks.push(
    check_(
      '回答先スプレッドシートが正しい',
      Boolean(form) && form.getDestinationId() === ss.getId(),
    ),
  );

  const triggerCount = ScriptApp.getProjectTriggers().filter(
    (trigger) => trigger.getHandlerFunction() === 'onFormSubmit',
  ).length;
  checks.push(check_('フォーム送信トリガーが1つだけ存在する', triggerCount === 1));

  const failed = checks.filter((item) => !item.passed);
  const result = { passed: failed.length === 0, checks };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * 最新のフォーム回答をもう一度処理へ渡し、二重処理されないことを検査する。
 * 既に管理シートへ記録済みの回答だけを対象にし、新しいメールは送信しない。
 *
 * @return {Object}
 */
function testDuplicateGuardWithLatestResponse() {
  const ss = getSpreadsheet_();
  const config = getConfig_(ss);
  const form = openConfiguredForm_(config);
  if (!form) throw new Error('設定済みGoogleフォームが見つかりません。');

  const responses = form.getResponses();
  if (!responses.length) throw new Error('テスト対象のフォーム回答がありません。');

  const latestResponse = responses[responses.length - 1];
  const processingKey = `FORM_RESPONSE:${latestResponse.getId()}`;
  const sheet = ss.getSheetByName(APP.INQUIRY_SHEET);
  const existingRow = findRowByProcessingKey_(sheet, processingKey);
  if (!existingRow) {
    throw new Error('最新回答が管理シートに未登録のため、安全上テストを中止しました。');
  }

  const beforeLastRow = sheet.getLastRow();
  onFormSubmit({ response: latestResponse });
  const afterLastRow = sheet.getLastRow();
  const matchingKeys = sheet
    .getRange(2, APP.COL.PROCESSING_KEY, Math.max(sheet.getLastRow() - 1, 1), 1)
    .getDisplayValues()
    .flat()
    .filter((value) => value === processingKey).length;

  const result = {
    passed: beforeLastRow === afterLastRow && matchingKeys === 1,
    processingKey,
    beforeLastRow,
    afterLastRow,
    matchingKeys,
    note: '既存処理キーを検出したため、管理行追加とメール送信処理をスキップしました。',
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * メール送信部分へ安全に障害を注入し、送信失敗とエラー内容が記録されるか検査する。
 * MailAppを呼ぶ前にテスト専用例外を発生させるため、実際のメールは送信されない。
 *
 * @return {Object}
 */
function testEmailFailureRecording() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName(APP.INQUIRY_SHEET);
    const config = getConfig_(ss);
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyyMMdd-HHmmss');
    const inquiryId = `TEST-EMAIL-FAIL-${timestamp}`;
    const processingKey = `TEST_EMAIL_FAILURE:${now.getTime()}`;
    const payload = {
      receivedAt: now,
      name: 'メール障害テスト（自動）',
      email: 'test@example.invalid',
      service: APP.SERVICES[0],
      preferredDate: '',
      message: '障害注入により送信失敗とエラー記録を確認するテストです。実メールは送信しません。',
    };

    const rowNumber = appendInitialRecord_(sheet, payload, inquiryId, processingKey);
    sendAndRecordEmails_(sheet, rowNumber, payload, inquiryId, config, ss.getUrl(), {
      forceCustomerFailure: true,
      forceAdminFailure: true,
    });

    const values = sheet.getRange(rowNumber, APP.COL.REPLY_STATUS, 1, 3).getDisplayValues()[0];
    const replyStatus = values[0];
    const errorText = values[1];
    const adminStatus = values[2];
    const passed =
      replyStatus === '送信失敗' &&
      adminStatus === '送信失敗' &&
      errorText.indexOf('テスト用の顧客メール障害') !== -1 &&
      errorText.indexOf('テスト用の運営者通知障害') !== -1;

    if (passed) sheet.getRange(rowNumber, APP.COL.STATUS).setValue('対応済み');

    const result = {
      passed,
      rowNumber,
      inquiryId,
      replyStatus,
      adminStatus,
      errorText,
      emailsSent: 0,
      note: 'MailApp呼び出し前の障害注入テストです。実際のメールは送信していません。',
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

function createInquiryForm_() {
  const form = FormApp.create(APP.FORM_TITLE);
  form
    .setDescription(APP.FORM_DESCRIPTION)
    .setConfirmationMessage(
      'お問い合わせを受け付けました。入力されたメールアドレスへ受付完了メールをお送りします。',
    )
    .setAllowResponseEdits(false)
    .setCollectEmail(false)
    .setLimitOneResponsePerUser(false)
    .setProgressBar(false)
    .setShowLinkToRespondAgain(false);

  form.addTextItem().setTitle(APP.QUESTION.NAME).setRequired(true);

  const emailValidation = FormApp.createTextValidation()
    .requireTextIsEmail()
    .setHelpText('有効なメールアドレスを入力してください。')
    .build();
  form
    .addTextItem()
    .setTitle(APP.QUESTION.EMAIL)
    .setValidation(emailValidation)
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle(APP.QUESTION.SERVICE)
    .setChoiceValues(APP.SERVICES)
    .setRequired(true);

  form.addDateItem().setTitle(APP.QUESTION.DATE).setIncludesYear(true).setRequired(false);
  form.addParagraphTextItem().setTitle(APP.QUESTION.MESSAGE).setRequired(true);
  return form;
}

function installFormSubmitTrigger_(form) {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'onFormSubmit')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
}

function responseToPayload_(response) {
  const answers = {};
  response.getItemResponses().forEach((itemResponse) => {
    answers[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  });

  return {
    receivedAt: response.getTimestamp() || new Date(),
    name: cleanText_(answers[APP.QUESTION.NAME]),
    email: cleanText_(answers[APP.QUESTION.EMAIL]).toLowerCase(),
    service: cleanText_(answers[APP.QUESTION.SERVICE]),
    preferredDate: normalizeDate_(answers[APP.QUESTION.DATE]),
    message: cleanText_(answers[APP.QUESTION.MESSAGE]),
  };
}

function validatePayload_(payload) {
  const errors = [];
  if (!payload.name) errors.push('名前が空です');
  if (!isValidEmail_(payload.email)) errors.push('メールアドレスの形式が不正です');
  if (APP.SERVICES.indexOf(payload.service) === -1) errors.push('希望サービスが不正です');
  if (!payload.message) errors.push('問い合わせ内容が空です');
  if (errors.length) throw new Error(errors.join(' / '));
}

function appendInitialRecord_(sheet, payload, inquiryId, processingKey) {
  const rowNumber = Math.max(sheet.getLastRow() + 1, 2);
  sheet.getRange(rowNumber, 1, 1, 12).setValues([
    [
      payload.receivedAt,
      inquiryId,
      payload.name,
      payload.email,
      payload.service,
      payload.preferredDate || '',
      payload.message,
      '未対応',
      '未送信',
      '',
      '未送信',
      processingKey,
    ],
  ]);
  SpreadsheetApp.flush();
  return rowNumber;
}

function sendAndRecordEmails_(sheet, rowNumber, payload, inquiryId, config, spreadsheetUrl, options) {
  const testOptions = options || {};
  const errors = [];

  try {
    if (testOptions.forceCustomerFailure) {
      throw new Error('テスト用の顧客メール障害（実メール送信なし）');
    }
    sendCustomerReceipt_(payload, inquiryId, config);
    sheet.getRange(rowNumber, APP.COL.REPLY_STATUS).setValue('送信済み');
  } catch (error) {
    sheet.getRange(rowNumber, APP.COL.REPLY_STATUS).setValue('送信失敗');
    errors.push(`顧客メール: ${errorMessage_(error)}`);
  }
  SpreadsheetApp.flush();

  try {
    if (testOptions.forceAdminFailure) {
      throw new Error('テスト用の運営者通知障害（実メール送信なし）');
    }
    sendAdminNotification_(payload, inquiryId, config, spreadsheetUrl);
    sheet.getRange(rowNumber, APP.COL.ADMIN_NOTICE_STATUS).setValue('送信済み');
  } catch (error) {
    sheet.getRange(rowNumber, APP.COL.ADMIN_NOTICE_STATUS).setValue('送信失敗');
    errors.push(`運営者通知: ${errorMessage_(error)}`);
  }

  sheet.getRange(rowNumber, APP.COL.ERROR).setValue(errors.join('\n'));
  SpreadsheetApp.flush();
}

function sendCustomerReceipt_(payload, inquiryId, config) {
  const dateText = formatPreferredDate_(payload.preferredDate);
  const body = [
    `${payload.name} 様`,
    '',
    `${config.serviceName}へお問い合わせいただき、ありがとうございます。`,
    '以下の内容で受け付けました。担当者が確認後、ご連絡します。',
    '',
    `問い合わせ番号：${inquiryId}`,
    `希望サービス：${payload.service}`,
    `希望日：${dateText}`,
    '',
    '問い合わせ内容：',
    payload.message,
    '',
    '※このメールは自動送信です。',
  ].join('\n');

  MailApp.sendEmail({
    to: payload.email,
    subject: config.customerSubject,
    body,
    name: config.senderName,
    replyTo: config.adminEmail,
  });
}

function sendAdminNotification_(payload, inquiryId, config, spreadsheetUrl) {
  const body = [
    '新しいお問い合わせを受け付けました。',
    '',
    `問い合わせ番号：${inquiryId}`,
    `受付日時：${formatDateTime_(payload.receivedAt)}`,
    `名前：${payload.name}`,
    `メールアドレス：${payload.email}`,
    `希望サービス：${payload.service}`,
    `希望日：${formatPreferredDate_(payload.preferredDate)}`,
    '',
    '問い合わせ内容：',
    payload.message,
    '',
    `管理シート：${spreadsheetUrl}`,
  ].join('\n');

  MailApp.sendEmail({
    to: config.adminEmail,
    subject: `【新規問い合わせ】${inquiryId}｜${payload.name} 様`,
    body,
    name: config.senderName,
  });
}

function issueInquiryId_(sheet, prefix, receivedAt) {
  const datePart = Utilities.formatDate(receivedAt, 'Asia/Tokyo', 'yyyyMMdd');
  const marker = `${prefix}-${datePart}-`;
  const lastRow = sheet.getLastRow();
  let maxSequence = 0;

  if (lastRow >= 2) {
    sheet
      .getRange(2, APP.COL.INQUIRY_ID, lastRow - 1, 1)
      .getDisplayValues()
      .flat()
      .forEach((value) => {
        if (value.indexOf(marker) !== 0) return;
        const sequence = Number(value.slice(marker.length));
        if (Number.isInteger(sequence)) maxSequence = Math.max(maxSequence, sequence);
      });
  }

  return `${marker}${String(maxSequence + 1).padStart(4, '0')}`;
}

function findRowByProcessingKey_(sheet, processingKey) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const match = sheet
    .getRange(2, APP.COL.PROCESSING_KEY, lastRow - 1, 1)
    .createTextFinder(processingKey)
    .matchEntireCell(true)
    .findNext();
  return match ? match.getRow() : null;
}

function getConfig_(ss) {
  const sheet = ss.getSheetByName(APP.CONFIG_SHEET);
  if (!sheet) throw new Error(`設定シート「${APP.CONFIG_SHEET}」が見つかりません。`);

  const lastRow = Math.max(sheet.getLastRow(), 2);
  const pairs = sheet.getRange(2, 1, lastRow - 1, 2).getDisplayValues();
  const values = {};
  pairs.forEach(([key, value]) => {
    if (key) values[key] = value;
  });

  return {
    serviceName: values['サービス名'] || 'Sunny Day Photo',
    adminEmail: values['運営者通知先'] || '',
    inquiryPrefix: values['問い合わせ番号接頭辞'] || 'PHOTO',
    senderName: values['送信者名'] || 'Sunny Day Photo 受付窓口',
    customerSubject:
      values['自動返信件名'] || '【Sunny Day Photo】お問い合わせを受け付けました',
    formId: values['フォームID'] || '',
  };
}

function saveRuntimeConfig_(ss, form) {
  const sheet = ss.getSheetByName(APP.CONFIG_SHEET);
  upsertConfigRow_(sheet, 'フォームID', form.getId(), 'GASが再実行時に同じフォームを使うためのID', '自動設定');
  upsertConfigRow_(sheet, '公開フォームURL', form.getPublishedUrl(), '顧客へ案内する回答用URL', '自動設定');
  upsertConfigRow_(sheet, '編集用フォームURL', form.getEditUrl(), '運営者がフォームを編集するURL', '自動設定');
  upsertConfigRow_(
    sheet,
    '最終セットアップ日時',
    formatDateTime_(new Date()),
    'setupSystemを最後に実行した日時',
    '自動設定',
  );
}

function upsertConfigRow_(sheet, key, value, description, editable) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const keys = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
  const index = keys.indexOf(key);
  const rowNumber = index === -1 ? lastRow + 1 : index + 2;
  sheet.getRange(rowNumber, 1, 1, 4).setValues([[key, value, description, editable]]);
}

function openConfiguredForm_(config) {
  if (!config.formId) return null;
  try {
    return FormApp.openById(config.formId);
  } catch (error) {
    console.warn(`設定済みフォームを開けないため新規作成します: ${errorMessage_(error)}`);
    return null;
  }
}

function ensureInquirySheet_(ss) {
  const sheet = ss.getSheetByName(APP.INQUIRY_SHEET);
  if (!sheet) throw new Error(`管理シート「${APP.INQUIRY_SHEET}」が見つかりません。`);
  const headers = [
    '受付日時',
    '問い合わせ番号',
    '名前',
    'メールアドレス',
    '希望サービス',
    '希望日',
    '問い合わせ内容',
    '対応状況',
    '返信状況',
    'エラー',
    '運営者通知状況',
    '処理キー',
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function renameAndHideRawResponseSheet_(ss) {
  Utilities.sleep(1200);
  const reserved = [APP.INQUIRY_SHEET, APP.CONFIG_SHEET, APP.TEST_SHEET];
  let raw = ss.getSheetByName(APP.RAW_RESPONSE_SHEET);
  if (!raw) {
    raw = ss
      .getSheets()
      .filter((sheet) => reserved.indexOf(sheet.getName()) === -1)
      .sort((a, b) => b.getSheetId() - a.getSheetId())[0];
    if (raw) raw.setName(APP.RAW_RESPONSE_SHEET);
  }
  if (raw && !raw.isSheetHidden()) raw.hideSheet();
}

function check_(name, passed) {
  return { name, passed: Boolean(passed) };
}

function cleanText_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function normalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value.getTime())) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed;
}

function formatPreferredDate_(value) {
  return value ? Utilities.formatDate(value, 'Asia/Tokyo', 'yyyy年M月d日') : '未指定';
}

function formatDateTime_(value) {
  return Utilities.formatDate(value, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function errorMessage_(error) {
  return String(error && error.message ? error.message : error).slice(0, 1000);
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('初期設定が未完了です。対象シートからsetupSystemを実行してください。');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}
