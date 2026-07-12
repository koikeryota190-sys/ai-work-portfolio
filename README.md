# AI Work Portfolio

AIを制作補助に使い、人間が要件確認・検証・納品責任を持つ働き方を形にするためのポートフォリオです。

## 公開サイト

[RYOTA / Web改善・業務自動化](https://ryota-ai-portfolio.koikeryota190.chatgpt.site)

## 現在できること

- WordPressを想定した文章・画像・表示調整
- HTML / CSSによるレスポンシブ実装
- GAS・Googleフォーム・Googleスプレッドシートによる業務自動化
- 変更内容、確認結果、操作方法を残す納品フロー

## CASE 01: ポートフォリオサイト

このサイト自体を最初の制作事例として作りました。実務実績と誤認されないよう「自主制作」と明記し、完成画面だけでなく、目的・実装・検証項目を説明しています。

### 設計目的

1. 何を任せられるかを最初の画面で伝える
2. AI利用よりも、検証と納品責任を前面に出す
3. 実績がない段階でも仕事の進め方を見せる
4. PCとスマートフォンの両方に対応する

### 実装内容

- セマンティックHTML
- レスポンシブCSS
- キーボードフォーカス表示
- スキップリンク
- prefers-reduced-motion対応
- 外部リンクの安全設定

## CASE 02: 出張撮影サービス向け問い合わせ受付自動化

架空の出張撮影サービスを想定し、Googleフォームからの問い合わせ受付、スプレッドシートへの管理記録、問い合わせ番号発行、顧客への受付メール、運営者通知、エラー記録をGoogle Apps Scriptで自動化しています。

![CASE 02 検証サマリー](projects/photography-inquiry-automation/evidence-summary.svg)

[匿名化した検証証跡を見る](projects/photography-inquiry-automation/EVIDENCE.md)

### 実装内容

- Googleフォームの自動生成と回答先シート接続
- `PHOTO-YYYYMMDD-0001` 形式の問い合わせ番号発行
- 対応状況「未対応」の自動登録
- 顧客への受付完了メール
- 運営者への新規問い合わせ通知
- 送信結果とエラー内容の記録
- フォーム回答IDによる二重送信防止
- LockServiceによる同時処理の競合防止
- 7種類のテスト計画

[コードと導入手順を見る](projects/photography-inquiry-automation/README.md)

## ファイル

- `site-source/page.tsx`: ページの構造と文章
- `site-source/globals.css`: 見た目とレスポンシブ対応
- `site-source/layout.tsx`: ページタイトルと説明
- `docs/qa-checklist.md`: サイトの動作確認項目と既知の制限
- `projects/photography-inquiry-automation/Code.gs`: 問い合わせ受付自動化コード
- `projects/photography-inquiry-automation/README.md`: 導入・運用手順
- `projects/photography-inquiry-automation/TEST_PLAN.md`: テスト項目と合格基準

## AIと人間の分担

AIは構成案、実装、コード確認、検証項目作成を支援しました。最終的に公開する内容、誇張の有無、対応範囲、制作予定との区別は人間側で判断しています。

## CASE 02の検証結果

2026年7月12日にGoogleアカウント上で初回セットアップと実機テストを実施しました。必須項目のみ、全項目入力、サービス3種類、入力検証、安全な障害注入によるメール失敗記録、二重送信防止、1秒差の短時間送信の7項目すべてが合格しました。
