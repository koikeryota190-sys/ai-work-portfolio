import Image from "next/image";

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfhV2fyFLb0QSjpd3NGI8KEYjbQ1JUaiDMPeOP15aPLQJOATw/viewform";

const plans = [
  {
    number: "01",
    name: "個人プロフィール撮影",
    english: "PORTRAIT",
    price: "18,000円〜",
    time: "約60分",
    copy: "仕事用プロフィールから、SNSや記念の一枚まで。自然な表情を引き出しながら撮影します。",
    points: ["写真データ30枚〜", "場所のご相談", "簡単な色味補正"],
  },
  {
    number: "02",
    name: "家族・記念撮影",
    english: "FAMILY",
    price: "26,000円〜",
    time: "約90分",
    copy: "誕生日、七五三、何気ない休日。かしこまりすぎない、ご家族らしい時間を残します。",
    points: ["写真データ60枚〜", "4名まで同料金", "お子さまのペース優先"],
    featured: true,
  },
  {
    number: "03",
    name: "イベント撮影",
    english: "EVENT",
    price: "38,000円〜",
    time: "2時間〜",
    copy: "地域イベントや社内行事、小規模パーティーに。進行を妨げず、空気ごと記録します。",
    points: ["写真データ100枚〜", "事前打ち合わせ", "延長のご相談可"],
  },
];

const flow = [
  ["01", "フォームからご相談", "ご希望の撮影内容・日程・場所をお知らせください。"],
  ["02", "内容とお見積りを確認", "原則2営業日以内に、撮影内容と料金をご案内します。"],
  ["03", "撮影当日", "会話をしながら、その方らしい表情と時間を残します。"],
  ["04", "データをお届け", "撮影から約2週間で、オンラインにて写真をお届けします。"],
];

const faqs = [
  [
    "写真を撮られることに慣れていません。",
    "立ち方や目線まで細かく決めるのではなく、会話や移動を交えながら進めます。緊張していることも、最初にそのままお伝えください。",
  ],
  [
    "撮影場所が決まっていなくても相談できますか？",
    "はい。撮りたい雰囲気や移動可能な範囲を伺い、公園・街並み・ご自宅などから候補をご提案します。",
  ],
  [
    "雨の場合はどうなりますか？",
    "屋外撮影は前日までに天候を確認し、日程変更または屋内への変更をご相談します。天候による日程変更に追加料金はかかりません。",
  ],
  [
    "問い合わせたら予約確定になりますか？",
    "いいえ。フォーム送信はご相談の受付です。内容とお見積りをご確認いただいた後、双方の合意をもって予約確定となります。",
  ],
];

function SunMark() {
  return <span className="sun-mark" aria-hidden="true" />;
}

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#content">
        本文へ移動
      </a>

      <header className="site-header" aria-label="サイトヘッダー">
        <a className="brand" href="#top" aria-label="Sunny Day Photo トップへ">
          <SunMark />
          <span>Sunny Day Photo</span>
        </a>
        <nav className="desktop-nav" aria-label="メインナビゲーション">
          <a href="#plans">撮影プラン</a>
          <a href="#about">私たちについて</a>
          <a href="#faq">よくある質問</a>
        </nav>
        <a
          className="header-cta"
          href={FORM_URL}
          target="_blank"
          rel="noreferrer"
        >
          撮影を相談する
        </a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy" id="content">
          <p className="eyebrow">ON-LOCATION PHOTOGRAPHY</p>
          <h1 id="hero-title">
            たいせつな一日を、
            <br />
            いつもの笑顔のままで。
          </h1>
          <p className="hero-description">
            ご希望の場所へ伺い、自然な表情とその日の空気まで
            <br className="desktop-break" />
            写真に残す出張撮影サービスです。
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href={FORM_URL}
              target="_blank"
              rel="noreferrer"
            >
              撮影について相談する
              <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#plans">
              プランを見る
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="service-line">
            <span className="leaf" aria-hidden="true">⌁</span>
            プロフィール・家族写真・イベント撮影
          </p>
        </div>
        <div className="hero-media">
          <Image
            src="/hero-family.jpg"
            alt="木漏れ日の中で笑い合う家族"
            width="1536"
            height="1024"
            priority
            sizes="(max-width: 920px) 100vw, 47vw"
          />
          <p className="hero-caption">
            <span>FAMILY PHOTO</span>
            その日らしさを、飾らずに。
          </p>
        </div>
      </section>

      <section className="promise-band" aria-label="サービスの特徴">
        <p>01　ご希望の場所へ出張</p>
        <span aria-hidden="true">•</span>
        <p>02　自然な表情を大切に</p>
        <span aria-hidden="true">•</span>
        <p>03　撮影前から丁寧に相談</p>
      </section>

      <section className="section plans-section" id="plans" aria-labelledby="plans-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PHOTO PLANS</p>
            <h2 id="plans-title">撮りたい時間に合わせた、3つのプラン。</h2>
          </div>
          <p>
            料金は内容に応じた目安です。ご希望を伺ったうえで、
            <br />
            撮影前にわかりやすくお見積りします。
          </p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <article
              className={`plan-card${plan.featured ? " plan-card-featured" : ""}`}
              key={plan.name}
            >
              {plan.featured && <p className="popular-label">人気のプラン</p>}
              <div className="plan-index">
                <span>{plan.number}</span>
                <small>{plan.english}</small>
              </div>
              <h3>{plan.name}</h3>
              <p className="plan-copy">{plan.copy}</p>
              <div className="plan-meta">
                <strong>{plan.price}</strong>
                <span>{plan.time}</span>
              </div>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a href={FORM_URL} target="_blank" rel="noreferrer">
                このプランを相談する <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <div className="about-visual" aria-hidden="true">
          <div className="about-circle">
            <SunMark />
            <span>BE YOURSELF</span>
          </div>
          <p>Sunny moments,<br />honestly captured.</p>
        </div>
        <div className="about-copy">
          <p className="eyebrow">ABOUT US</p>
          <h2 id="about-title">
            上手に笑うより、
            <br />
            あなたらしくいられること。
          </h2>
          <p>
            写真のために一日を止めるのではなく、いつもの会話や仕草の中にある表情を見つけたい。Sunny Day Photoは、撮影前の相談から当日まで、安心して過ごせるテンポを大切にしています。
          </p>
          <dl className="about-list">
            <div>
              <dt>丁寧な事前確認</dt>
              <dd>用途、雰囲気、苦手なことまで伺います。</dd>
            </div>
            <div>
              <dt>無理のない撮影</dt>
              <dd>お子さまやイベントの進行を優先します。</dd>
            </div>
            <div>
              <dt>自然な仕上がり</dt>
              <dd>過度に作り込まず、その日の色を整えます。</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section flow-section" aria-labelledby="flow-title">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">HOW IT WORKS</p>
            <h2 id="flow-title">ご相談から写真のお届けまで。</h2>
          </div>
          <p>はじめての方にも、次に何をするかがわかる流れです。</p>
        </div>
        <ol className="flow-list">
          {flow.map(([number, title, copy]) => (
            <li key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="faq-heading">
          <p className="eyebrow">FREQUENTLY ASKED QUESTIONS</p>
          <h2 id="faq-title">よくある質問</h2>
          <p>不明点が残る場合は、フォームから気軽にご相談ください。</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                <span>Q</span>
                {question}
                <i aria-hidden="true" />
              </summary>
              <div className="faq-answer">
                <span>A</span>
                <p>{answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="contact-section" aria-labelledby="contact-title">
        <div className="contact-sun" aria-hidden="true"><SunMark /></div>
        <p className="eyebrow">CONTACT</p>
        <h2 id="contact-title">残したい時間を、聞かせてください。</h2>
        <p>
          まだ内容や場所が決まっていなくても大丈夫です。
          <br />
          フォーム送信後、受付メールをお送りします。
        </p>
        <a
          className="button button-primary contact-button"
          href={FORM_URL}
          target="_blank"
          rel="noreferrer"
        >
          撮影について相談する
          <span aria-hidden="true">↗</span>
        </a>
        <small>フォーム送信だけでは予約確定になりません</small>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <SunMark />
          <span>Sunny Day Photo</span>
        </a>
        <p>たいせつな一日を、いつもの笑顔のままで。</p>
        <nav aria-label="フッターナビゲーション">
          <a href="#plans">撮影プラン</a>
          <a href="#about">私たちについて</a>
          <a href="#faq">よくある質問</a>
        </nav>
        <p className="fiction-note">※ポートフォリオ用に制作した架空のサービスです。</p>
        <p className="copyright">© 2026 Sunny Day Photo</p>
      </footer>
    </main>
  );
}
