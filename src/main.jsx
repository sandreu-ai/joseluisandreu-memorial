import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Mail, Send, Upload } from 'lucide-react';
import { MEDIA_BUCKET, isSupabaseConfigured, supabase } from './supabase';
import './styles.css';

const demoMemories = [
  {
    id: 'welcome',
    name: 'Family and friends',
    relationship: 'Everyone who loved him',
    message: 'This wall is here for stories, photos, videos, prayers, and the little moments that help us remember Jose Luis together.',
    caption: 'A shared place to gather what we carry with us.',
    media_urls: [],
    created_at: new Date().toISOString(),
  },
];

const tributeParagraphs = [
  'Bendecimos al Señor por la vida de nuestro padre, José Luis, el corazón de una familia inmensa y profundamente unida. Fue esposo amado, padre de nueve hijos, suegro de nueve más y orgulloso abuelo de cuarenta y dos nietos.',
  'Durante los últimos 35 años de su vida, se entregó por completo al servicio de Dios como misionero del Camino Neocatecumenal dentro de la Iglesia Católica, enviado junto a su esposa por San Juan Pablo II. Junto a su amada esposa, Ángela, se “gastó y desgastó” por el anuncio del Evangelio, siguiendo con fidelidad el mandato del Señor: «Id por todo el mundo y proclamad el Evangelio a toda criatura» (Mc 16, 15).',
  'Somos testigos de su infatigable celo por la misión, de su disponibilidad constante para ir donde la Iglesia lo necesitara y de su profundo amor por Cristo y por las personas que el Señor puso en su camino. Su mayor deseo era que otros pudieran encontrarse con Jesucristo y experimentar su amor y su misericordia.',
  'Para muchos, José Luis fue mucho más que un amigo o un catequista; fue una verdadera figura paterna. Con su sabiduría, su cercanía y su amor sincero, acompañó a innumerables personas a lo largo de sus vidas. Muchos encontraron en él una palabra de ánimo, un consejo oportuno y el cariño de un padre.',
  'Damos gracias a Dios por el regalo de su vida, por su testimonio de fe y por el amor que sembró en su familia, en la Iglesia y en todos aquellos que tuvieron la gracia de conocerlo.',
  'En estos momentos difíciles, muchas personas nos han preguntado cómo pueden apoyar a nuestra familia. Les pedimos sobre todo sus oraciones por el eterno descanso de nuestro padre y por el consuelo y la fortaleza de nuestra madre, de sus hijos, de sus nietos y de toda nuestra familia.',
  'Agradecemos de corazón cada oración, mensaje, recuerdo y muestra de cariño. Confiamos en la promesa de Cristo:',
];

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function App() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', relationship: '', message: '', caption: '' });
  const [files, setFiles] = useState([]);

  const galleryItems = useMemo(
    () => memories.flatMap((memory) => (memory.media_urls || []).map((item) => ({ ...item, memory }))),
    [memories]
  );

  async function loadMemories() {
    setLoading(true);
    if (!isSupabaseConfigured) {
      const local = JSON.parse(localStorage.getItem('memorial-demo-memories') || '[]');
      setMemories([...local, ...demoMemories]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setStatus('We could not load memories yet. Please refresh in a moment.');
    } else {
      setMemories(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMemories();
  }, []);

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
  }, [memories.length]);

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
      setStatus('Please add your name and a memory before sharing.');
      return;
    }

    setStatus('Sharing your memory…');
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
        setStatus('Demo memory added locally. Connect Supabase to accept real public submissions.');
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
      setStatus('Thank you. Your memory is now part of the wall.');
      await loadMemories();
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Something went wrong while sharing your memory.');
    }
  }

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a href="#top" className="brand">Jose Luis Andreu</a>
        <div>
          <a href="#tribute">Tribute</a>
          <a href="#share">Share</a>
          <a href="#memories">Memories</a>
        </div>
      </nav>

      <header id="top" className="hero">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">In loving memory</p>
          <h1>Jose Luis Andreu</h1>
          <p className="life-dates">4/26/1954 - 06/14/2026</p>
          <p className="lede">A public place for family and friends to remember him, share stories, and preserve the photos and videos that hold his presence.</p>
          <div className="hero-actions">
            <a className="button primary" href="#share"><Send size={18} /> Share a Memory</a>
          </div>
        </div>
        <figure className="hero-photo" data-reveal>
          <img src="/hero.jpg" alt="Jose Luis Andreu holding a gold chalice in a church" />
        </figure>
      </header>

      <section id="tribute" className="section tribute-section" data-reveal>
        <div className="tribute-card">
          <p className="section-kicker">Un testimonio de fe y amor</p>
          <h2>Siervo bueno y fiel.</h2>
          <div className="tribute-copy">
            {tributeParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <blockquote>
              «En la casa de mi Padre hay muchas moradas; si no, ¿os lo habría dicho, puesto que voy a prepararos lugar? Y cuando haya ido y os haya preparado un lugar, volveré y os tomaré conmigo, para que donde esté yo, estéis también vosotros.»
              <cite>Juan 14, 2-3</cite>
            </blockquote>
            <p>Que el Señor lo reciba en su gloria y le conceda el descanso eterno.</p>
            <p className="tribute-closing">Ha combatido el buen combate, ha terminado la carrera y ha mantenido la fe.</p>
          </div>
        </div>
      </section>

      <section className="intro section" data-reveal>
        <p className="section-kicker">For everyone who knew him</p>
        <h2>Bring the memories together.</h2>
        <p>Stories can live in texts, camera rolls, old phones, group chats, and quiet conversations. This site gathers them into one lasting place — immediately visible, public, and easy to share.</p>
      </section>

      <section id="share" className="section share-grid">
        <div data-reveal>
          <p className="section-kicker">Share something</p>
          <h2>Write a memory. Add a photo or video.</h2>
          <p>Posts are designed to appear right away. Please share what feels true: a story, a prayer, a funny moment, a voice, a place, a lesson, or a photo you treasure.</p>
          {!isSupabaseConfigured && (
            <div className="notice">
              <strong>Local preview mode:</strong> submissions are saved only in this browser until Supabase is connected.
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="memory-form" data-reveal>
          <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
          <label>Relationship <input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="Friend, cousin, coworker…" /></label>
          <label>Memory <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Share a memory of Jose Luis…" rows="6" /></label>
          <label>Caption for photos/videos <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Where/when was this?" /></label>
          <label className="file-box"><Upload size={20} /> Photos or videos
            <input type="file" multiple accept="image/*,video/mp4,video/quicktime,video/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            <span>{files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Choose files'}</span>
          </label>
          <button className="button primary" type="submit">Share Now</button>
          {status && <p className="form-status" role="status">{status}</p>}
        </form>
      </section>

      <section id="memories" className="section" data-reveal>
        <p className="section-kicker">Memory wall</p>
        <h2>Stories shared for Jose Luis</h2>
        {loading ? <p>Loading memories…</p> : (
          <div className="memory-wall">
            {memories.map((memory) => (
              <article className="memory-card" key={memory.id} data-reveal>
                <p className="memory-message">“{memory.message}”</p>
                {memory.caption && <p className="caption">{memory.caption}</p>}
                <footer>
                  <strong>{memory.name}</strong>
                  {memory.relationship && <span>{memory.relationship}</span>}
                  <time>{formatDate(memory.created_at)}</time>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="gallery" className="section gallery-section" data-reveal>
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">Photos & videos</p>
            <h2>Shared moments</h2>
          </div>
          <Camera aria-hidden="true" />
        </div>
        {galleryItems.length === 0 ? <p className="empty">Photos and videos will appear here as people share them.</p> : (
          <div className="gallery">
            {galleryItems.map((item, index) => (
              <figure key={`${item.url}-${index}`} data-reveal>
                {item.type?.startsWith('video/') ? <video src={item.url} controls /> : <img src={item.url} alt={item.memory.caption || `Shared memory from ${item.memory.name}`} />}
                <figcaption>{item.memory.caption || item.memory.name}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <p>Made as a place to remember Jose Luis Andreu.</p>
        <a href="mailto:?subject=Memories of Jose Luis Andreu&body=Please visit joseluisandreu.com to share your memories, photos, and videos."><Mail size={16} /> Invite someone to share</a>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
