const services = [
  {
    number: "01",
    title: "Web改善",
    description:
      "WordPressの文章・画像更新、表示崩れ、フォームなど、範囲の明確な修正から対応します。",
    tags: ["WordPress", "HTML / CSS", "レスポンシブ"],
  },
  {
    number: "02",
    title: "業務自動化",
    description:
      "Googleフォームやスプレッドシートをつなぎ、転記・集計・通知などの定型作業を減らします。",
    tags: ["GAS", "Spreadsheet", "自動化"],
  },
  {
    number: "03",
    title: "動作検証",
    description:
      "変更内容と確認結果を記録し、再現手順と既知の制限が分かる状態で納品します。",
    tags: ["検証", "テスト", "手順書"],
  },
];

const process = [
  ["01", "確認", "目的、対象範囲、変更してはいけない箇所を整理します。"],
  ["02", "実装", "作業用環境で小さく変更し、差分を確認します。"],
  ["03", "検証", "画面・機能・例外時の動作をチェックします。"],
  ["04", "納品", "変更内容、確認結果、操作方法をまとめて渡します。"],
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        本文へ移動
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="ページ上部へ">
          <strong>RYOTA</strong>
          <span>/ WEB &amp; AUTOMATION</span>
        </a>
        <nav aria-label="メインナビゲーション">
          <a href="#service">SERVICE</a>
          <a href="#work">WORK</a>
          <a href="#process">PROCESS</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">WEB MAINTENANCE / WORKFLOW AUTOMATION</p>
            <h1 id="hero-title">
              直す。<br />
              整える。<br />
              自動化する。
            </h1>
            <p className="hero-description">
              WordPressの軽微修正から、GASによる業務自動化まで。
              <br />
              検証と手順書まで含めて、確実に納品します。
            </p>
            <a className="primary-button" href="#work">
              制作サンプルを見る <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="blueprint" aria-hidden="true">
            <div className="axis axis-x" />
            <div className="axis axis-y" />
            <div className="blueprint-label label-a">A</div>
            <div className="blueprint-label label-b">B</div>
            <div className="blueprint-label label-c">C</div>
            <div className="blueprint-box box-one">
              <span>scope</span>
            </div>
            <div className="blueprint-box box-two">
              <span>build</span>
            </div>
            <div className="blueprint-box box-three">
              <span>verify</span>
            </div>
            <div className="blueprint-code">
              <span>// workflow</span>
              <code>check → build → test</code>
            </div>
            <div className="status-dot" />
            <div className="status-copy">STATUS: READY</div>
          </div>
        </section>

        <section className="service-section" id="service" aria-labelledby="service-title">
          <div className="section-heading">
            <p className="section-number">01 / SERVICE</p>
            <h2 id="service-title">任せられること</h2>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number}>
                <div className="service-mark" aria-hidden="true">
                  <span>{service.number}</span>
                  <div className={`mark-shape mark-${service.number}`} />
                </div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul aria-label={`${service.title}の対応領域`}>
                    {service.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="work-section" id="work" aria-labelledby="work-title">
          <div className="section-heading inverted-heading">
            <p className="section-number">02 / SELECTED WORK</p>
            <h2 id="work-title">最初の制作事例</h2>
          </div>
          <article className="project-card">
            <div className="project-index">
              <span>CASE 01</span>
              <span>自主制作 / 2026.07</span>
            </div>
            <div className="project-copy">
              <p className="project-label">RESPONSIVE PORTFOLIO</p>
              <h3>このポートフォリオサイト</h3>
              <p>
                「何を任せられるか」「どう進めるか」を短時間で判断できるよう、
                情報設計からレスポンシブ実装、アクセシビリティ確認まで行った1ページサイトです。
              </p>
              <div className="project-facts">
                <div>
                  <span>課題</span>
                  <strong>実績ゼロの段階でも、仕事の進め方を証明する</strong>
                </div>
                <div>
                  <span>実装</span>
                  <strong>構造化HTML / CSS / レスポンシブ</strong>
                </div>
                <div>
                  <span>検証</span>
                  <strong>キーボード操作 / 画面幅 / 動きの抑制</strong>
                </div>
              </div>
              <a
                className="text-link"
                href="https://github.com/koikeryota190-sys/ai-work-portfolio"
                target="_blank"
                rel="noreferrer"
              >
                GitHubで制作記録を見る <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="project-visual" aria-hidden="true">
              <div className="window-bar"><i /><i /><i /></div>
              <div className="mini-layout">
                <div className="mini-title" />
                <div className="mini-line short" />
                <div className="mini-line" />
                <div className="mini-button" />
                <div className="mini-grid"><i /><i /><i /></div>
              </div>
            </div>
          </article>

          <article className="next-project">
            <div>
              <span>NEXT / CASE 02</span>
              <h3>受付から通知までをつなぐGAS自動化</h3>
            </div>
            <p>Googleフォーム → スプレッドシート → 自動返信 → PDF生成</p>
            <strong>制作予定</strong>
          </article>
        </section>

        <section className="process-section" id="process" aria-labelledby="process-title">
          <div className="section-heading">
            <p className="section-number">03 / PROCESS</p>
            <h2 id="process-title">仕事の進め方</h2>
          </div>
          <ol className="process-list">
            {process.map(([number, title, description]) => (
              <li key={number}>
                <span className="process-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <p className="section-number">04 / CONTACT</p>
          <div>
            <h2 id="contact-title">小さな修正から、確実に。</h2>
            <p>
              現在、WordPressの軽微修正・ページ更新・GAS自動化の
              制作サンプルを増やしています。
            </p>
          </div>
          <a
            className="contact-link"
            href="https://github.com/koikeryota190-sys/ai-work-portfolio"
            target="_blank"
            rel="noreferrer"
          >
            制作記録を確認する <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>

      <footer>
        <p>RYOTA / WEB &amp; AUTOMATION</p>
        <p>BUILT WITH AI ASSISTANCE. VERIFIED BY A HUMAN.</p>
        <p>© 2026 RYOTA</p>
      </footer>
    </>
  );
}
