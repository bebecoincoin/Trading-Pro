import { useState } from 'react';
import { COURSES, Course, Lesson } from '@/lib/courses';
import { Check, Clock, GraduationCap, Star } from 'lucide-react';
import clsx from 'clsx';

export default function Learn() {
  const [activeCourse, setActiveCourse] = useState<Course>(COURSES[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson>(COURSES[0].lessons[0]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <GraduationCap size={22} className="text-accent" /> Cours
        </h1>
        <p className="text-text-muted text-sm">
          Du debutant au pro : trading, analyse technique, blockchain, psychologie.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {COURSES.map((c) => {
          const Icon = c.icon;
          return (
          <button
            key={c.id}
            onClick={() => {
              setActiveCourse(c);
              setActiveLesson(c.lessons[0]);
            }}
            className={clsx(
              'card p-4 text-left transition',
              activeCourse.id === c.id
                ? 'border-accent/60 shadow-glow'
                : 'hover:border-accent/30'
            )}
          >
            <div className={clsx('mb-2 w-10 h-10 rounded-lg bg-bg-soft border border-bg-border grid place-items-center', c.iconColor)}>
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div className="font-bold">{c.title}</div>
            <div className="text-xs text-text-muted mt-1">{c.description}</div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={clsx(
                  'badge',
                  c.level === 'debutant' && 'badge-green',
                  c.level === 'intermediaire' && 'badge-violet',
                  c.level === 'avance' && 'badge-gold'
                )}
              >
                {c.level}
              </span>
              <span className="text-xs text-text-dim">{c.lessons.length} lecons</span>
            </div>
          </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <aside className="card p-3 h-fit">
          <div className="text-xs uppercase tracking-wider text-text-dim px-2 pt-1 pb-2 flex items-center gap-2">
            <activeCourse.icon size={13} className={activeCourse.iconColor} /> {activeCourse.title}
          </div>
          <ul className="space-y-0.5">
            {activeCourse.lessons.map((l, i) => (
              <li key={l.id}>
                <button
                  onClick={() => setActiveLesson(l)}
                  className={clsx(
                    'w-full text-left px-2 py-2 rounded-lg flex items-start gap-2 transition',
                    activeLesson.id === l.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-muted hover:text-text hover:bg-bg-soft'
                  )}
                >
                  <span
                    className={clsx(
                      'mt-0.5 w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0',
                      activeLesson.id === l.id
                        ? 'bg-accent text-bg'
                        : 'bg-bg-soft text-text-dim border border-bg-border'
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-tight">{l.title}</div>
                    <div className="text-[11px] text-text-dim flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {l.durationMin} min
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={clsx(
                'badge',
                activeLesson.level === 'debutant' && 'badge-green',
                activeLesson.level === 'intermediaire' && 'badge-violet',
                activeLesson.level === 'avance' && 'badge-gold'
              )}
            >
              {activeLesson.level}
            </span>
            <span className="text-xs text-text-dim flex items-center gap-1">
              <Clock size={11} /> {activeLesson.durationMin} min
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">{activeLesson.title}</h2>
          <p className="text-text-muted mt-1">{activeLesson.summary}</p>

          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-text/95">
            {activeLesson.body.split('\n\n').map((p, i) => (
              <p key={i}>
                {p.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < p.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>

          <div className="mt-6 card p-4 bg-bg-soft/40 border-bg-border">
            <div className="text-sm font-bold flex items-center gap-2 mb-2">
              <Star size={14} className="text-accent-gold" /> Points cles
            </div>
            <ul className="space-y-1.5">
              {activeLesson.keyPoints.map((k, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check size={14} className="mt-1 text-accent-green shrink-0" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}
