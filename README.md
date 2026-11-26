# Professional Portfolio

Data Analyst | BI | Business Process Automation

Approved version V2.3. Static HTML, CSS and JavaScript; no build step required.

Website: https://shahmen2088.github.io/professional-portfolio/

## Analytics

The optional Yandex Metrica loader is shared by the portfolio and resume pages.
Set the same public counter ID in their `data-counter-id` attributes. An ID of
`0` disables analytics completely. No OAuth token or secret belongs in this repo.

The loader runs only on this portfolio's production URL. Local previews and
other projects are excluded. Session Replay (Webvisor) and hash pageviews are
disabled; external link tracking and accurate bounce measurement are enabled.

Run the focused checks with `node --test tests/metrika.test.cjs`.
