import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Heart, Mail, PlayCircle, Send, Upload, Video } from 'lucide-react';
import { MEDIA_BUCKET, isSupabaseConfigured, supabase } from './supabase';
import { Analytics } from '@vercel/analytics/react';
import './styles.css';

const interviews = [
  {
    title: 'Jose Luis Andreu interview (part 1)',
    videoId: 'umdoomRDveM',
    url: 'https://youtu.be/umdoomRDveM',
  },
  {
    title: 'Jose Luis Andreu interview (part 2)',
    videoId: 'qDe8r-Ee38g',
    url: 'https://youtu.be/qDe8r-Ee38g',
  },
];

const demoMemories = [
  {
    id: 'welcome',
    name: 'Family and friends',
    relationship: 'Everyone who loved him',
    message: 'This wall is here for stories, photos, videos, prayers, and the little moments that help us remember José Luis together.',
    caption: 'A shared place to gather what we carry with us.',
    media_urls: [],
    created_at: new Date().toISOString(),
  },
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
        <a href="#top" className="brand"><Heart size={18} /> José Luis Andreu</a>
        <div>
          <a href="#share">Share</a>
          <a href="#memories">Memories</a>
          <a href="#videos">Interviews</a>
        </div>
      </nav>

      <header id="top" className="hero">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">In loving memory</p>
          <h1>José Luis Andreu</h1>
          <p className="lede">A public place for family and friends to remember him, share stories, and preserve the photos and videos that hold his presence.</p>
          <div className="hero-actions">
            <a className="button primary" href="#share"><Send size={18} /> Share a Memory</a>
            <a className="button ghost" href="#videos"><PlayCircle size={18} /> Watch His Interviews</a>
          </div>
        </div>
        <figure className="hero-photo" data-reveal>
          <img src="/hero.jpg" alt="José Luis Andreu holding a gold chalice in a church" />
        </figure>
      </header>

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
          <label>Memory <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Share a memory of José Luis…" rows="6" /></label>
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
        <h2>Stories shared for José Luis</h2>
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

      <section id="videos" className="section videos-section" data-reveal>
        <p className="section-kicker">In his own words</p>
        <h2>Interviews with José Luis</h2>
        <p className="section-intro">These conversations preserve his voice, his stories, and the way he carried himself — something family and friends can return to whenever they need to hear him again.</p>
        <div className="videos">
          {interviews.map((video) => (
            <article className="video-card" key={video.videoId} data-reveal>
              <div className="iframe-wrap">
                <iframe src={`https://www.youtube.com/embed/${video.videoId}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              </div>
              <h3><Video size={18} /> {video.title}</h3>
              <a href={video.url} target="_blank" rel="noreferrer">Open on YouTube</a>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <p>Made as a place to remember José Luis Andreu.</p>
        <a href="mailto:?subject=Memories of José Luis Andreu&body=Please visit joseluisandreu.com to share your memories, photos, and videos."><Mail size={16} /> Invite someone to share</a>
      </footer>
      <Analytics />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
