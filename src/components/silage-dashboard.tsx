"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { SilageDashboardData } from "@/lib/weather";
import heroImage from "../../public/riverview-silage-hero.jpg";
import domnickBrand from "../../public/domnick-seeds-brand.jpg";
import riverviewLogo from "../../public/riverview-logo.png";

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

function formatDate(date: string | null, full = false) {
  if (!date) return "—";
  const value = new Date(`${date}T12:00:00Z`);
  return (full ? longDate : shortDate).format(value);
}

function statusClass(status: string) {
  return status.toLowerCase().replaceAll(" ", "-");
}

export function SilageDashboard({ data }: { data: SilageDashboardData }) {
  const [query, setQuery] = useState("");

  const filteredFields = useMemo(() => {
    const search = query.trim().toLowerCase();
    return data.projections.filter((field) => !search || `${field.id} ${field.name} ${field.hybrid}`.toLowerCase().includes(search));
  }, [data.projections, query]);

  const firstField = data.projections[0];
  const nextFields = data.projections.slice(0, 5);
  const averageGdu = Math.round(data.projections.reduce((sum, field) => sum + field.currentGdu, 0) / data.projections.length);
  const forecastWeek = data.forecastDays.slice(0, 7);
  const maxGdu = Math.max(...forecastWeek.map((day) => day.gdu), 1);
  const liveLabel = data.dataStatus === "live" ? "Live outlook" : data.dataStatus === "forecast-fallback" ? "Observed + normal outlook" : "Saved Aug. 10 outlook";

  return (
    <main className="app-frame">
      <header className="compact-hero">
        <Image src={heroImage} alt="Corn silage harvest near Morris, Minnesota" fill priority sizes="100vw" className="compact-hero__image" />
        <div className="compact-hero__shade" />
        <div className="compact-hero__content shell">
          <div className="compact-nav">
            <div className="compact-brand"><Image src={domnickBrand} alt="Domnick Seeds" priority sizes="130px" /></div>
            <div className="compact-location">
              <span className="live-dot" />
              <div><strong>{liveLabel}</strong><small>Through {formatDate(data.lastObservedDate)}</small></div>
              <Image src={riverviewLogo} alt="Riverview" sizes="94px" />
            </div>
          </div>
          <div className="compact-title">
            <div><p>2026 harvest dashboard</p><h1>Riverview silage order</h1></div>
            <div className="next-callout"><span>Next moisture check</span><strong>{formatDate(firstField.projectedChopDate)}</strong><small>#{firstField.id} {firstField.name}</small></div>
          </div>
        </div>
      </header>

      <div className="dashboard shell">
        <section className="compact-metrics" aria-label="Season summary">
          <article><span>Fields</span><strong>{data.projections.length}</strong><small>{new Set(data.projections.map((field) => field.hybrid)).size} hybrids</small></article>
          <article><span>Avg. observed GDU</span><strong>{averageGdu.toLocaleString()}</strong><small>By planting date</small></article>
          <article><span>14-day forecast</span><strong>+{data.forecastTotalGdu}</strong><small>West River Dairy</small></article>
          <article className="compact-metrics__accent"><span>First target</span><strong>{formatDate(firstField.projectedChopDate)}</strong><small>BL GDU − 300</small></article>
        </section>

        <div className="dashboard-grid">
          <section className="panel field-panel" aria-labelledby="field-order-title">
            <div className="panel-heading field-panel__heading">
              <div><span className="eyebrow">Field order</span><h2 id="field-order-title">Chopping outlook</h2></div>
              <button type="button" className="print-button" onClick={() => window.print()}>Print</button>
            </div>

            <div className="compact-toolbar">
              <label className="compact-search"><span aria-hidden="true">⌕</span><span className="sr-only">Search fields</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search field or hybrid" /></label>
              <span className="field-count">{filteredFields.length} {filteredFields.length === 1 ? "field" : "fields"}</span>
            </div>

            <div className="compact-table-wrap">
              <table className="compact-table">
                <thead><tr><th>#</th><th>Field / hybrid</th><th className="optional-col">Planted</th><th>GDU progress</th><th>Check target</th><th className="optional-col">Status</th></tr></thead>
                <tbody>
                  {filteredFields.map((field) => (
                    <tr key={field.id}>
                      <td><span className="compact-rank">{field.rank}</span></td>
                      <td><strong>#{field.id} {field.name}</strong><small>{field.hybrid} · {field.relativeMaturity} RM</small></td>
                      <td className="optional-col"><strong>{formatDate(field.plantingDate)}</strong><small>{field.blackLayerGdu.toLocaleString()} BL</small></td>
                      <td className="compact-progress"><div><strong>{field.currentGdu.toLocaleString()}</strong><span>/ {field.chopTargetGdu.toLocaleString()}</span></div><div className="mini-track"><i style={{ width: `${field.progressPercent}%` }} /></div><small>{field.remainingToChop} left</small></td>
                      <td><strong className="check-date">{formatDate(field.projectedChopDate)}</strong><small>Black layer {formatDate(field.projectedBlackLayerDate)}</small></td>
                      <td className="optional-col"><span className={`compact-status compact-status--${statusClass(field.status)}`}>{field.status}</span><small>{field.projectionBasis === "14-day forecast" ? "Forecast" : "Forecast + normals"}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFields.length === 0 && <p className="empty-results">No matching fields.</p>}
            </div>
          </section>

          <aside className="side-rail">
            <section className="panel next-panel">
              <div className="panel-heading"><div><span className="eyebrow">At a glance</span><h2>Closest to watch</h2></div><span className="as-of">As of {formatDate(data.reportDate)}</span></div>
              <ol className="next-list">
                {nextFields.map((field) => (
                  <li key={field.id} className={field.rank === 1 ? "next-list__priority" : undefined}><span>{field.rank}</span><div><strong>#{field.id} {field.name}</strong><small>{field.rank === 1 ? `Watch first · ${field.hybrid}` : field.hybrid}</small></div><time dateTime={field.projectedChopDate ?? undefined}>{formatDate(field.projectedChopDate)}</time></li>
                ))}
              </ol>
            </section>

            <section className="panel weather-panel">
              <div className="panel-heading"><div><span className="eyebrow">7-day heat</span><h2>Forecast GDUs</h2></div><strong className="forecast-total">+{Math.round(forecastWeek.reduce((sum, day) => sum + day.gdu, 0))}</strong></div>
              <div className="mini-forecast" aria-label="Seven-day GDU forecast">
                {forecastWeek.map((day) => (
                  <div key={day.date}><span>{weekday.format(new Date(`${day.date}T12:00:00Z`))}</span><div><i style={{ height: `${Math.max(14, (day.gdu / maxGdu) * 100)}%` }} /></div><strong>{Math.round(day.gdu)}</strong></div>
                ))}
              </div>
            </section>

            <section className="panel formula-panel">
              <span className="eyebrow">Planning rule</span>
              <div className="formula"><strong>Black-layer GDU</strong><b>− 300</b><span>= moisture-check target</span></div>
              <p>Use this order to begin sampling. Confirm whole-plant moisture before the chopper enters a field.</p>
            </section>
          </aside>
        </div>

        <footer className="compact-footer"><span>Domnick Seeds · Riverview Silage Outlook</span><span>{data.location.station} · Generated {formatDate(data.reportDate, true)}</span></footer>
      </div>
    </main>
  );
}
