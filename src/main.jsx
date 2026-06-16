import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Mail, Send, Upload } from 'lucide-react';
import { MEDIA_BUCKET, isSupabaseConfigured, supabase } from './supabase';
import './styles.css';

const content = {
  en: {
    languageName: 'English',
    switchLabel: 'Español',
    nav: { tribute: 'Tribute', share: 'Share', memories: 'Memories' },
    hero: {
      eyebrow: 'In loving memory',
      name: 'Jose Luis Andreu',
      dates: '4/26/1954 - 06/14/2026',
      alt: 'Jose Luis Andreu holding a gold chalice in a church',
      lede: 'A public place for family and friends to remember him, share stories, and preserve the photos and videos that hold his presence.',
      cta: 'Share a Memory',
    },
    tribute: {
      kicker: 'A testimony of faith and love',
      title: 'Good and faithful servant.',
      paragraphs: [
        'We bless the Lord for the life of our father, José Luis, the heart of an immense and profoundly united family. He was a beloved husband, father of nine children, father-in-law to nine more, and proud grandfather of forty-two grandchildren.',
        'During the last 35 years of his life, he gave himself completely to the service of God as a missionary of the Neocatechumenal Way within the Catholic Church, sent together with his wife by Saint John Paul II. Alongside his beloved wife, Ángela, he “spent himself and was spent” for the proclamation of the Gospel, faithfully following the command of the Lord: “Go into all the world and proclaim the Gospel to every creature” (Mk 16:15).',
        'We are witnesses to his tireless zeal for the mission, his constant availability to go wherever the Church needed him, and his deep love for Christ and for the people the Lord placed in his path. His greatest desire was that others could encounter Jesus Christ and experience his love and mercy.',
        'For many, José Luis was much more than a friend or a catechist; he was a true father figure. With his wisdom, his closeness, and his sincere love, he accompanied countless people throughout their lives. Many found in him a word of encouragement, timely counsel, and the affection of a father.',
        'We give thanks to God for the gift of his life, for his witness of faith, and for the love he sowed in his family, in the Church, and in all those who had the grace of knowing him.',
        'In these difficult moments, many people have asked us how they can support our family. Above all, we ask for your prayers for the eternal rest of our father and for the consolation and strength of our mother, his children, his grandchildren, and our entire family.',
        'We are deeply grateful for every prayer, message, memory, and expression of affection. We trust in the promise of Christ:',
      ],
      scripture: '“In my Father’s house there are many dwelling places. If there were not, would I have told you that I go to prepare a place for you? And if I go and prepare a place for you, I will come again and will take you to myself, so that where I am, there you may be also.”',
      scriptureRef: 'John 14:2-3',
      prayer: 'May the Lord receive him into his glory and grant him eternal rest.',
      closing: 'He fought the good fight, he finished the race, and he kept the faith.',
    },
    intro: {
      kicker: 'For everyone who knew him',
      title: 'Bring the memories together.',
      body: 'Stories can live in texts, camera rolls, old phones, group chats, and quiet conversations. This site gathers them into one lasting place — immediately visible, public, and easy to share.',
    },
    share: {
      kicker: 'Share something',
      title: 'Write a memory. Add a photo or video.',
      body: 'Posts are designed to appear right away. Please share what feels true: a story, a prayer, a funny moment, a voice, a place, a lesson, or a photo you treasure.',
      previewMode: 'Local preview mode:',
      previewText: 'submissions are saved only in this browser until Supabase is connected.',
      labels: {
        name: 'Name',
        relationship: 'Relationship',
        memory: 'Memory',
        caption: 'Caption for photos/videos',
        files: 'Photos or videos',
      },
      placeholders: {
        name: 'Your name',
        relationship: 'Friend, cousin, coworker…',
        memory: 'Share a memory of Jose Luis…',
        caption: 'Where/when was this?',
      },
      chooseFiles: 'Choose files',
      selected: (count) => `${count} file${count > 1 ? 's' : ''} selected`,
      submit: 'Share Now',
    },
    memories: {
      kicker: 'Memory wall',
      title: 'Stories of Jose Luis shared',
      loading: 'Loading memories…',
      empty: 'No stories have been shared yet. Be the first to add a memory, prayer, photo, or video.',
    },
    gallery: {
      kicker: 'Photos & videos',
      title: 'Shared moments',
      empty: 'Photos and videos will appear here as people share them.',
      alt: (name) => `Shared memory from ${name}`,
    },
    footer: {
      made: 'Made as a place to remember Jose Luis Andreu.',
      invite: 'Invite someone to share',
      subject: 'Memories of Jose Luis Andreu',
      body: 'Please visit joseluisandreu.com to share your memories, photos, and videos.',
    },
    status: {
      missingRequired: 'Please add your name and a memory before sharing.',
      sharing: 'Sharing your memory…',
      localAdded: 'Demo memory added locally. Connect Supabase to accept real public submissions.',
      thankYou: 'Thank you. Your memory is now part of the wall.',
      loadError: 'We could not load memories yet. Please refresh in a moment.',
      submitError: 'Something went wrong while sharing your memory.',
    },
    demoMemory: {
      name: 'Family and friends',
      relationship: 'Everyone who loved him',
      message: 'This wall is here for stories, photos, videos, prayers, and the little moments that help us remember Jose Luis together.',
      caption: 'A shared place to gather what we carry with us.',
    },
  },
  es: {
    languageName: 'Español',
    switchLabel: 'English',
    nav: { tribute: 'Tributo', share: 'Compartir', memories: 'Recuerdos' },
    hero: {
      eyebrow: 'En memoria amorosa',
      name: 'Jose Luis Andreu',
      dates: '4/26/1954 - 06/14/2026',
      alt: 'Jose Luis Andreu sosteniendo un cáliz dorado en una iglesia',
      lede: 'Un lugar público para que familiares y amigos lo recuerden, compartan historias y conserven las fotos y videos que guardan su presencia.',
      cta: 'Compartir un recuerdo',
    },
    tribute: {
      kicker: 'Un testimonio de fe y amor',
      title: 'Siervo bueno y fiel.',
      paragraphs: [
        'Bendecimos al Señor por la vida de nuestro padre, José Luis, el corazón de una familia inmensa y profundamente unida. Fue esposo amado, padre de nueve hijos, suegro de nueve más y orgulloso abuelo de cuarenta y dos nietos.',
        'Durante los últimos 35 años de su vida, se entregó por completo al servicio de Dios como misionero del Camino Neocatecumenal dentro de la Iglesia Católica, enviado junto a su esposa por San Juan Pablo II. Junto a su amada esposa, Ángela, se “gastó y desgastó” por el anuncio del Evangelio, siguiendo con fidelidad el mandato del Señor: «Id por todo el mundo y proclamad el Evangelio a toda criatura» (Mc 16, 15).',
        'Somos testigos de su infatigable celo por la misión, de su disponibilidad constante para ir donde la Iglesia lo necesitara y de su profundo amor por Cristo y por las personas que el Señor puso en su camino. Su mayor deseo era que otros pudieran encontrarse con Jesucristo y experimentar su amor y su misericordia.',
        'Para muchos, José Luis fue mucho más que un amigo o un catequista; fue una verdadera figura paterna. Con su sabiduría, su cercanía y su amor sincero, acompañó a innumerables personas a lo largo de sus vidas. Muchos encontraron en él una palabra de ánimo, un consejo oportuno y el cariño de un padre.',
        'Damos gracias a Dios por el regalo de su vida, por su testimonio de fe y por el amor que sembró en su familia, en la Iglesia y en todos aquellos que tuvieron la gracia de conocerlo.',
        'En estos momentos difíciles, muchas personas nos han preguntado cómo pueden apoyar a nuestra familia. Les pedimos sobre todo sus oraciones por el eterno descanso de nuestro padre y por el consuelo y la fortaleza de nuestra madre, de sus hijos, de sus nietos y de toda nuestra familia.',
        'Agradecemos de corazón cada oración, mensaje, recuerdo y muestra de cariño. Confiamos en la promesa de Cristo:',
      ],
      scripture: '«En la casa de mi Padre hay muchas moradas; si no, ¿os lo habría dicho, puesto que voy a prepararos lugar? Y cuando haya ido y os haya preparado un lugar, volveré y os tomaré conmigo, para que donde esté yo, estéis también vosotros.»',
      scriptureRef: 'Juan 14, 2-3',
      prayer: 'Que el Señor lo reciba en su gloria y le conceda el descanso eterno.',
      closing: 'Ha combatido el buen combate, ha terminado la carrera y ha mantenido la fe.',
    },
    intro: {
      kicker: 'Para todos los que lo conocieron',
      title: 'Reunamos los recuerdos.',
      body: 'Las historias pueden vivir en mensajes, álbumes, teléfonos antiguos, chats de grupo y conversaciones silenciosas. Este sitio las reúne en un lugar permanente: visible al instante, público y fácil de compartir.',
    },
    share: {
      kicker: 'Comparte algo',
      title: 'Escribe un recuerdo. Agrega una foto o video.',
      body: 'Las publicaciones están diseñadas para aparecer de inmediato. Comparte lo que nazca del corazón: una historia, una oración, un momento divertido, una voz, un lugar, una enseñanza o una foto que atesores.',
      previewMode: 'Modo de vista previa local:',
      previewText: 'las publicaciones se guardan solo en este navegador hasta que Supabase esté conectado.',
      labels: {
        name: 'Nombre',
        relationship: 'Relación',
        memory: 'Recuerdo',
        caption: 'Descripción para fotos/videos',
        files: 'Fotos o videos',
      },
      placeholders: {
        name: 'Tu nombre',
        relationship: 'Amigo, primo, compañero…',
        memory: 'Comparte un recuerdo de Jose Luis…',
        caption: '¿Dónde/cuándo fue?',
      },
      chooseFiles: 'Elegir archivos',
      selected: (count) => `${count} archivo${count > 1 ? 's' : ''} seleccionado${count > 1 ? 's' : ''}`,
      submit: 'Compartir ahora',
    },
    memories: {
      kicker: 'Muro de recuerdos',
      title: 'Historias compartidas por Jose Luis',
      loading: 'Cargando recuerdos…',
      empty: 'Todavía no se han compartido historias. Sé el primero en agregar un recuerdo, una oración, una foto o un video.',
    },
    gallery: {
      kicker: 'Fotos y videos',
      title: 'Momentos compartidos',
      empty: 'Las fotos y videos aparecerán aquí a medida que las personas los compartan.',
      alt: (name) => `Recuerdo compartido por ${name}`,
    },
    footer: {
      made: 'Hecho como un lugar para recordar a Jose Luis Andreu.',
      invite: 'Invitar a alguien a compartir',
      subject: 'Recuerdos de Jose Luis Andreu',
      body: 'Visita joseluisandreu.com para compartir tus recuerdos, fotos y videos.',
    },
    status: {
      missingRequired: 'Agrega tu nombre y un recuerdo antes de compartir.',
      sharing: 'Compartiendo tu recuerdo…',
      localAdded: 'Recuerdo de demostración agregado localmente. Conecta Supabase para aceptar publicaciones públicas reales.',
      thankYou: 'Gracias. Tu recuerdo ya forma parte del muro.',
      loadError: 'No pudimos cargar los recuerdos todavía. Actualiza la página en un momento.',
      submitError: 'Algo salió mal al compartir tu recuerdo.',
    },
    demoMemory: {
      name: 'Familiares y amigos',
      relationship: 'Todos los que lo amaron',
      message: 'Este muro está aquí para reunir historias, fotos, videos, oraciones y los pequeños momentos que nos ayudan a recordar juntos a Jose Luis.',
      caption: 'Un lugar compartido para reunir lo que llevamos con nosotros.',
    },
  },
};

function getDemoMemories(language) {
  const demo = content[language].demoMemory;
  return [
    {
      id: `welcome-${language}`,
      ...demo,
      media_urls: [],
      created_at: new Date().toISOString(),
    },
  ];
}

function formatDate(value, language) {
  const locale = language === 'es' ? 'es' : 'en';
  return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function App() {
  const [language, setLanguage] = useState('en');
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', relationship: '', message: '', caption: '' });
  const [files, setFiles] = useState([]);
  const t = content[language];

  const galleryItems = useMemo(
    () => memories.flatMap((memory) => (memory.media_urls || []).map((item) => ({ ...item, memory }))),
    [memories]
  );

  async function loadMemories() {
    setLoading(true);
    if (!isSupabaseConfigured) {
      const local = JSON.parse(localStorage.getItem('memorial-demo-memories') || '[]');
      setMemories([...local, ...getDemoMemories(language)]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setStatus(t.status.loadError);
    } else {
      setMemories(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    document.documentElement.lang = language;
    setStatus('');
    loadMemories();
  }, [language]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );

    document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--scroll-y', `${window.scrollY * 0.08}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [memories.length, language]);

  async function uploadFiles(memoryId) {
    const uploaded = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
      const path = `${memoryId}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, type: file.type, name: file.name });
    }
    return uploaded;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setStatus(t.status.missingRequired);
      return;
    }

    setStatus(t.status.sharing);
    const memoryId = crypto.randomUUID();

    try {
      if (!isSupabaseConfigured) {
        const newMemory = {
          id: memoryId,
          ...form,
          media_urls: [],
          created_at: new Date().toISOString(),
        };
        const local = JSON.parse(localStorage.getItem('memorial-demo-memories') || '[]');
        localStorage.setItem('memorial-demo-memories', JSON.stringify([newMemory, ...local]));
        setForm({ name: '', relationship: '', message: '', caption: '' });
        setFiles([]);
        setStatus(t.status.localAdded);
        await loadMemories();
        return;
      }

      const media = await uploadFiles(memoryId);
      const { error } = await supabase.from('memories').insert({
        id: memoryId,
        name: form.name.trim(),
        relationship: form.relationship.trim(),
        message: form.message.trim(),
        caption: form.caption.trim(),
        media_urls: media,
      });
      if (error) throw error;
      setForm({ name: '', relationship: '', message: '', caption: '' });
      setFiles([]);
      setStatus(t.status.thankYou);
      await loadMemories();
    } catch (error) {
      console.error(error);
      setStatus(error.message || t.status.submitError);
    }
  }

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-links">
          <a href="#tribute">{t.nav.tribute}</a>
          <a href="#share">{t.nav.share}</a>
          <a href="#memories">{t.nav.memories}</a>
        </div>
        <button className="language-toggle" type="button" onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} aria-label={`Switch language to ${t.switchLabel}`}>
          {t.switchLabel}
        </button>
      </nav>

      <header id="top" className="hero hero-centered">
        <figure className="hero-photo" data-reveal>
          <img src="/hero.jpg" alt={t.hero.alt} />
          <figcaption className="hero-caption">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.name}</h1>
            <p className="life-dates">{t.hero.dates}</p>
          </figcaption>
        </figure>
        <div className="hero-copy" data-reveal>
          <p className="lede">{t.hero.lede}</p>
          <div className="hero-actions">
            <a className="button primary" href="#share"><Send size={18} /> {t.hero.cta}</a>
          </div>
        </div>
      </header>

      <section id="tribute" className="section tribute-section" data-reveal>
        <div className="tribute-card">
          <p className="section-kicker">{t.tribute.kicker}</p>
          <h2>{t.tribute.title}</h2>
          <div className="tribute-copy">
            {t.tribute.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <blockquote>
              {t.tribute.scripture}
              <cite>{t.tribute.scriptureRef}</cite>
            </blockquote>
            <p>{t.tribute.prayer}</p>
            <p className="tribute-closing">{t.tribute.closing}</p>
          </div>
        </div>
      </section>

      <section className="intro section" data-reveal>
        <p className="section-kicker">{t.intro.kicker}</p>
        <h2>{t.intro.title}</h2>
        <p>{t.intro.body}</p>
      </section>

      <section id="share" className="section share-grid">
        <div data-reveal>
          <p className="section-kicker">{t.share.kicker}</p>
          <h2>{t.share.title}</h2>
          <p>{t.share.body}</p>
          {!isSupabaseConfigured && (
            <div className="notice">
              <strong>{t.share.previewMode}</strong> {t.share.previewText}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="memory-form" data-reveal>
          <label>{t.share.labels.name} <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.share.placeholders.name} /></label>
          <label>{t.share.labels.relationship} <input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder={t.share.placeholders.relationship} /></label>
          <label>{t.share.labels.memory} <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.share.placeholders.memory} rows="6" /></label>
          <label>{t.share.labels.caption} <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder={t.share.placeholders.caption} /></label>
          <label className="file-box"><Upload size={20} /> {t.share.labels.files}
            <input type="file" multiple accept="image/*,video/mp4,video/quicktime,video/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            <span>{files.length ? t.share.selected(files.length) : t.share.chooseFiles}</span>
          </label>
          <button className="button primary" type="submit">{t.share.submit}</button>
          {status && <p className="form-status" role="status">{status}</p>}
        </form>
      </section>

      <section id="memories" className="section" data-reveal>
        <p className="section-kicker">{t.memories.kicker}</p>
        <h2>{t.memories.title}</h2>
        {loading ? <p>{t.memories.loading}</p> : memories.length === 0 ? (
          <div className="empty memory-empty">
            <p>{t.memories.empty}</p>
            <a className="button ghost" href="#share">{t.hero.cta}</a>
          </div>
        ) : (
          <div className="memory-wall">
            {memories.map((memory) => (
              <article className="memory-card" key={memory.id} data-reveal>
                <div>
                  <p className="memory-message">“{memory.message}”</p>
                  {memory.caption && <p className="caption">{memory.caption}</p>}
                  {memory.media_urls?.length > 0 && (
                    <div className="memory-card-media" aria-label="Photos and videos shared with this memory">
                      {memory.media_urls.map((item, index) => (
                        <figure key={`${memory.id}-${item.url}-${index}`}>
                          {item.type?.startsWith('video/') ? <video src={item.url} controls /> : <img src={item.url} alt={memory.caption || t.gallery.alt(memory.name)} />}
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
                <footer>
                  <strong>{memory.name}</strong>
                  {memory.relationship && <span>{memory.relationship}</span>}
                  <time>{formatDate(memory.created_at, language)}</time>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="gallery" className="section gallery-section" data-reveal>
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">{t.gallery.kicker}</p>
            <h2>{t.gallery.title}</h2>
          </div>
          <Camera aria-hidden="true" />
        </div>
        {galleryItems.length === 0 ? <p className="empty">{t.gallery.empty}</p> : (
          <div className="gallery">
            {galleryItems.map((item, index) => (
              <figure key={`${item.url}-${index}`} data-reveal>
                {item.type?.startsWith('video/') ? <video src={item.url} controls /> : <img src={item.url} alt={item.memory.caption || t.gallery.alt(item.memory.name)} />}
                <figcaption>{item.memory.caption || item.memory.name}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <p>{t.footer.made}</p>
        <a href={`mailto:?subject=${encodeURIComponent(t.footer.subject)}&body=${encodeURIComponent(t.footer.body)}`}><Mail size={16} /> {t.footer.invite}</a>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
