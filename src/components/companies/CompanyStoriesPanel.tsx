import type { CompanyStory } from "@/types/domain";
import { formatAsOf } from "@/lib/format";

type CompanyStoriesPanelProps = {
  companyName: string;
  stories: CompanyStory[];
};

const SOURCE_LABEL: Record<CompanyStory["source"], string> = {
  news: "Google News",
  reddit: "Reddit",
  social: "Social",
  gdelt: "GDELT",
  hackernews: "Hacker News",
  bbc: "BBC Business",
  sec: "SEC EDGAR",
  npr: "NPR Business",
};

export function CompanyStoriesPanel({
  companyName,
  stories,
}: CompanyStoriesPanelProps) {
  return (
    <section className="workbench-card company-stories-panel">
      <p className="company-stories-intro">
        Recent external coverage for {companyName} with supply-chain relevance.
      </p>
      {stories.length === 0 ? (
        <p className="company-stories-empty">
          No recent stories in the last 24 hours. Use refresh or wait for the scheduled crawl.
        </p>
      ) : (
        <ul className="company-stories-list">
          {stories.map((story) => (
            <li key={story.id} className="company-stories-item">
              <a
                href={story.url}
                target="_blank"
                rel="noreferrer"
                className="company-stories-link"
              >
                {story.title}
              </a>
              <div className="company-stories-meta">
                <span className="company-stories-badge">
                  {SOURCE_LABEL[story.source]}
                </span>
                <span>{formatAsOf(story.publishedAt)}</span>
              </div>
              {story.summary ? (
                <p className="company-stories-summary">{story.summary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
