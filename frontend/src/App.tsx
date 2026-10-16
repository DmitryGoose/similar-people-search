import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react'

type Person = {
  id: string
  name: string
  occupation: string
  score: number
  initials: string
  tone: string
  traits: string[]
  explanation: string
  source: { title: string; url: string; checkedAt: string }
}

const people: Person[] = [
  {
    id: 'person-01',
    name: 'Александр Петров',
    occupation: 'актёр театра и кино',
    score: 91,
    initials: 'АП',
    tone: 'amber',
    traits: ['овальная форма лица', 'выраженные скулы', 'тёмные волосы'],
    explanation: 'Наиболее близкое сочетание формы лица, линии бровей и короткой текстурной стрижки.',
    source: { title: 'Профиль публичной персоны — демонстрационный источник', url: 'https://example.com/person-01', checkedAt: '16.10.2026' },
  },
  {
    id: 'person-02',
    name: 'Иван Янковский',
    occupation: 'актёр',
    score: 84,
    initials: 'ИЯ',
    tone: 'blue',
    traits: ['линия челюсти', 'посадка глаз', 'форма причёски'],
    explanation: 'Похожий силуэт лица и пропорции верхней части; различается форма подбородка.',
    source: { title: 'Профиль публичной персоны — демонстрационный источник', url: 'https://example.com/person-02', checkedAt: '16.10.2026' },
  },
  {
    id: 'person-03',
    name: 'Марк Эйдельштейн',
    occupation: 'актёр',
    score: 76,
    initials: 'МЭ',
    tone: 'violet',
    traits: ['вытянутый овал', 'брови', 'общий типаж'],
    explanation: 'Совпадает вытянутый овал и контраст черт; причёска и линия носа отличаются.',
    source: { title: 'Профиль публичной персоны — демонстрационный источник', url: 'https://example.com/person-03', checkedAt: '16.10.2026' },
  },
]

const maxSize = 10 * 1024 * 1024
const allowed = ['image/jpeg', 'image/png', 'image/webp']

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'ready' | 'loading' | 'done'>('idle')
  const [step, setStep] = useState(0)
  const [source, setSource] = useState<Person | null>(null)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const validate = (next: File) => {
    if (!allowed.includes(next.type)) return 'Поддерживаются только JPG, PNG и WebP.'
    if (next.size > maxSize) return 'Файл больше 10 МБ. Выберите изображение меньшего размера.'
    return ''
  }

  const chooseFile = (next?: File) => {
    if (!next) return
    const message = validate(next)
    if (message) {
      setError(message)
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(next)
    setPreview(URL.createObjectURL(next))
    setError('')
    setSaved(false)
    setStatus('ready')
  }

  const onFile = (event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0])
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    chooseFile(event.dataTransfer.files?.[0])
  }

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
    setError('')
    setSaved(false)
    setSource(null)
    setStatus('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  const search = async () => {
    if (!file) return
    setStatus('loading')
    setStep(0)
    for (let i = 0; i < 3; i += 1) {
      setStep(i)
      await new Promise((resolve) => window.setTimeout(resolve, 620))
    }
    setStatus('done')
  }

  const saveCollection = () => {
    localStorage.setItem('lookalike-demo-collection', JSON.stringify(people.map(({ id, name, score }) => ({ id, name, score }))))
    setSaved(true)
  }

  const steps = ['Описываем нейтральные признаки', 'Ищем по корпусу с BM25', 'Готовим объяснение и источники']

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="LookAlike — на главную">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>LookAlike</span>
        </a>
        <nav aria-label="Основная навигация">
          <a href="#how">Как это работает</a>
          <a href="#safety">Ограничения</a>
          <span className="prototype-badge">Прототип</span>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Визуальные референсы для кастинга</p>
            <h1>Найдите публичных людей с похожим <em>типажом</em></h1>
            <p className="lead">Загрузите портрет — получите объяснимую подборку с оценкой релевантности и источниками за несколько секунд.</p>
            <div className="trust-row">
              <span><b>01</b> Только публичные персоны</span>
              <span><b>02</b> Объяснимый результат</span>
              <span><b>03</b> Фото не сохраняется</span>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="orbit-face">?</div>
            <span className="orbit-chip chip-one">форма лица</span>
            <span className="orbit-chip chip-two">причёска</span>
            <span className="orbit-chip chip-three">черты</span>
          </div>
        </section>

        <section className="workspace" aria-labelledby="upload-title">
          <div className="section-heading">
            <span className="section-number">01</span>
            <div><p className="eyebrow">Начните поиск</p><h2 id="upload-title">Загрузите портрет</h2></div>
            <p>Лучше всего работает фото анфас, с одним лицом и хорошим освещением.</p>
          </div>

          <div className="upload-layout">
            <label className={`dropzone ${preview ? 'has-preview' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
              {preview ? (
                <img src={preview} alt="Предпросмотр выбранного портрета" />
              ) : (
                <div className="drop-content">
                  <span className="upload-icon" aria-hidden="true">↥</span>
                  <strong>Перетащите фото сюда</strong>
                  <span>или нажмите, чтобы выбрать файл</span>
                  <small>JPG, PNG или WebP · до 10 МБ</small>
                </div>
              )}
            </label>

            <div className="upload-panel">
              {file ? (
                <>
                  <p className="panel-label">Выбранный файл</p>
                  <div className="file-row"><span className="file-icon">IMG</span><div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} МБ · готово к анализу</small></div></div>
                  <div className="privacy-note"><span>◈</span><p><strong>Локальное превью</strong><br />В прототипе изображение не покидает ваш браузер.</p></div>
                  <button className="primary-button" onClick={search} disabled={status === 'loading'}>{status === 'loading' ? 'Анализируем…' : 'Найти похожих'}<span>→</span></button>
                  <button className="text-button" onClick={clear}>Удалить и выбрать другое фото</button>
                </>
              ) : (
                <>
                  <p className="panel-label">Что вы получите</p>
                  <ol className="benefits">
                    <li><span>1</span><div><strong>Короткую подборку</strong><p>До пяти релевантных публичных персон.</p></div></li>
                    <li><span>2</span><div><strong>Причины сходства</strong><p>Какие наблюдаемые признаки совпали.</p></div></li>
                    <li><span>3</span><div><strong>Проверяемые источники</strong><p>Ссылка и дата проверки для каждой карточки.</p></div></li>
                  </ol>
                </>
              )}
            </div>
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        {status === 'loading' && (
          <section className="analysis" aria-live="polite">
            <div className="spinner"><span /></div>
            <p className="eyebrow">Демонстрационный анализ</p>
            <h2>{steps[step]}</h2>
            <div className="progress"><span style={{ width: `${(step + 1) * 33.34}%` }} /></div>
            <div className="step-row">{steps.map((item, index) => <span className={index <= step ? 'active' : ''} key={item}>{index < step ? '✓' : index + 1} {item.split(' ')[0]}</span>)}</div>
          </section>
        )}

        {status === 'done' && (
          <section className="results" aria-live="polite">
            <div className="section-heading result-heading">
              <span className="section-number">02</span>
              <div><p className="eyebrow">Результат поиска</p><h2>Похожие типажи</h2></div>
              <p>Демо-выдача отсортирована по релевантности. Процент не означает вероятность идентичности или родства.</p>
            </div>
            <div className="summary-card"><span>✦</span><p><strong>Общее в подборке:</strong> овальная форма лица, выраженная линия скул, тёмные волосы и близкая посадка глаз.</p></div>
            <div className="result-grid">
              {people.map((person, index) => (
                <article className="person-card" key={person.id}>
                  <div className={`portrait ${person.tone}`}><span>{person.initials}</span><small>#{index + 1}</small></div>
                  <div className="person-content">
                    <div className="person-title"><div><h3>{person.name}</h3><p>{person.occupation}</p></div><strong>{person.score}%<small>релевантность</small></strong></div>
                    <div className="score-track"><span style={{ width: `${person.score}%` }} /></div>
                    <div className="trait-list">{person.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
                    <p className="explanation">{person.explanation}</p>
                    <button className="card-button" onClick={() => setSource(person)}>Источник и детали <span>↗</span></button>
                  </div>
                </article>
              ))}
            </div>
            <div className="result-actions">
              <button className="primary-button" onClick={saveCollection}>{saved ? 'Подборка сохранена ✓' : 'Сохранить подборку'}</button>
              <button className="secondary-button" onClick={clear}>Попробовать другое фото</button>
            </div>
          </section>
        )}

        <section className="how" id="how">
          <div><p className="eyebrow">Под капотом</p><h2>От портрета к объяснимой выдаче</h2></div>
          <div className="how-grid">
            <article><span>01</span><h3>Описание</h3><p>Vision-модель превращает фото в нейтральное текстовое описание наблюдаемых черт.</p></article>
            <article><span>02</span><h3>Поиск BM25</h3><p>Самостоятельный индекс ранжирует документы проверенного корпуса публичных персон.</p></article>
            <article><span>03</span><h3>Объяснение</h3><p>LLM формулирует сходства только по найденным документам и прикладывает источники.</p></article>
          </div>
        </section>

        <section className="safety" id="safety">
          <span className="safety-icon">◎</span>
          <div><p className="eyebrow">Ответственное использование</p><h2>Ищем визуальный референс, а не личность</h2><p>LookAlike не распознаёт людей, не ищет частных лиц и не делает выводов о происхождении, здоровье или характере. Загружайте только фотографии, которые вправе использовать.</p></div>
        </section>
      </main>

      <footer><span>LookAlike · НИРС · ИУ5-53б</span><span>Интерактивный прототип · 2026</span></footer>

      {source && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSource(null)}>
          <section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="source-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSource(null)} aria-label="Закрыть">×</button>
            <p className="eyebrow">Источник результата</p>
            <h2 id="source-title">{source.name}</h2>
            <p>{source.explanation}</p>
            <dl><div><dt>Документ</dt><dd>{source.source.title}</dd></div><div><dt>Проверен</dt><dd>{source.source.checkedAt}</dd></div><div><dt>Статус</dt><dd>Демонстрационные данные</dd></div></dl>
            <p className="modal-note">В рабочей версии здесь будет ссылка на реальный проверенный источник корпуса. Текущая ссылка не ведёт на профиль и используется только для проверки интерфейса.</p>
            <a className="primary-button link-button" href={source.source.url} target="_blank" rel="noreferrer">Открыть демо-ссылку <span>↗</span></a>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
