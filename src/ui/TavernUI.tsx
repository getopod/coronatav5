import { ReactNode, ButtonHTMLAttributes, HTMLAttributes } from 'react';
import './tavern-theme.css';

// --- Types ---
export interface TavernPanelProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  children: ReactNode;
  fantasyBg?: string | null;
  className?: string;
}

export interface TavernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface TavernDisplayCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string | ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export interface RunHistory {
  id: string;
  trial: number;
  result: string;
  score: number;
  date: string;
}

export interface RunHistoryWindowProps {
  runs: RunHistory[];
  onClose: () => void;
}

// --- Components ---
export function TavernPanel({ header, children, fantasyBg, className = '', ...props }: Readonly<TavernPanelProps>) {
  return (
    <div className={`tavern-panel tavern-edge ${className}`} {...props}>
      {fantasyBg && (
        <div
          className="tavern-fantasy-bg"
          /* eslint-disable-next-line react/no-inline-styles */
          style={{ backgroundImage: fantasyBg ? `url(${fantasyBg})` : undefined }}
        />
      )}
      {header && <div className="tavern-header">{header}</div>}
      <div className="tavern-panel-content">{children}</div>
    </div>
  );
}

export function TavernButton({ children, size = 'md', ...props }: Readonly<TavernButtonProps>) {
  let sizeClass = '';
  if (size === 'lg') sizeClass = 'tavern-btn-lg';
  else if (size === 'sm') sizeClass = 'tavern-btn-sm';
  return (
    <button className={`tavern-btn ${sizeClass}`} {...props}>
      {children}
    </button>
  );
}

export function TavernDisplayCard({ title, description, icon, className = '', ...props }: Readonly<TavernDisplayCardProps>) {
  return (
    <div className={`tavern-panel tavern-display-card ${className}`} {...props}>
      {icon && <div className="tavern-card-icon">{icon}</div>}
      <div className="tavern-card-content">
        <div className="tavern-card-title">{title}</div>
        {description && <div className="tavern-card-desc">{description}</div>}
      </div>
    </div>
  );
}

export function RunHistoryWindow({ runs, onClose }: Readonly<RunHistoryWindowProps>) {
  return (
    <TavernPanel header="Run History" fantasyBg={null}>
      <div className="tavern-run-history-list">
        {runs.length === 0 ? (
          <div className="tavern-run-history-empty">No runs yet!</div>
        ) : (
          runs.map(run => (
            <TavernDisplayCard
              key={run.id}
              title={`Trial ${run.trial} - ${run.result}`}
              description={`Score: ${run.score} | Date: ${run.date}`}
              icon={<img src="/assets/trophy.svg" alt="Trophy" className="tavern-card-trophy" />}
            />
          ))
        )}
      </div>
      <div className="tavern-run-history-actions">
        <TavernButton size="md" onClick={onClose}>Close</TavernButton>
      </div>
    </TavernPanel>
  );
}
