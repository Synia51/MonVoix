import { useState, useRef, useCallback } from "react";

// ─── SYNTHÈSE VOCALE ────────────────────────────────────────────────────────
const speak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fr-FR";
  utter.rate = 0.85;
  utter.pitch = 1.1;
  utter.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find((v) => v.lang.startsWith("fr"));
  if (frVoice) utter.voice = frVoice;
  window.speechSynthesis.speak(utter);
};

// ─── DONNÉES ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "pictos",   label: "💬 Communiquer", icon: "💬" },
  { id: "emotions", label: "😊 Je me sens",  icon: "😊" },
  { id: "routine",  label: "📅 Ma journée",  icon: "📅" },
  { id: "famille",  label: "👨‍👩‍👧 Famille",    icon: "👨‍👩‍👧" },
  { id: "message",  label: "✉️ Message",      icon: "✉️" },
];

const EMOTION_GROUPS = [
  {
    id: "positives", label: "😄 Je me sens bien", color: "#34D399", bg: "#F0FFF9",
    items: [
      { id: "tres-heureux", emoji: "🤩", label: "Très heureux",   speech: "Je suis très heureux" },
      { id: "heureux",      emoji: "😊", label: "Heureux",         speech: "Je suis heureux" },
      { id: "calme",        emoji: "😌", label: "Calme",           speech: "Je me sens calme" },
      { id: "fier",         emoji: "😎", label: "Fier",            speech: "Je suis fier" },
      { id: "excite",       emoji: "🥳", label: "Excité",          speech: "Je suis excité" },
      { id: "amour",        emoji: "🥰", label: "Amour",           speech: "Je me sens aimé" },
    ],
  },
  {
    id: "neutres", label: "😐 Comme ci comme ça", color: "#60A5FA", bg: "#EFF6FF",
    items: [
      { id: "bien",    emoji: "🙂", label: "Bien",      speech: "Je vais bien" },
      { id: "fatigue", emoji: "😴", label: "Fatigué",   speech: "Je suis fatigué" },
      { id: "ennuye",  emoji: "😑", label: "Ennuyé",    speech: "Je suis ennuyé" },
      { id: "perdu",   emoji: "😕", label: "Perdu",     speech: "Je suis perdu" },
      { id: "surpris", emoji: "😲", label: "Surpris",   speech: "Je suis surpris" },
      { id: "timide",  emoji: "😶", label: "Timide",    speech: "Je suis timide" },
    ],
  },
  {
    id: "difficiles", label: "😢 Je me sens pas bien", color: "#F97316", bg: "#FFF7ED",
    items: [
      { id: "triste",      emoji: "😢", label: "Triste",         speech: "Je suis triste" },
      { id: "tres-triste", emoji: "😭", label: "Très triste",    speech: "Je suis très triste" },
      { id: "colere",      emoji: "😡", label: "En colère",      speech: "Je suis en colère" },
      { id: "tres-colere", emoji: "🤬", label: "Très en colère", speech: "Je suis très très en colère" },
      { id: "peur",        emoji: "😨", label: "J'ai peur",      speech: "J'ai peur" },
      { id: "stresse",     emoji: "😰", label: "Stressé",        speech: "Je suis stressé" },
    ],
  },
  {
    id: "physique", label: "🤕 Mon corps", color: "#FF6B6B", bg: "#FFF0F0",
    items: [
      { id: "mal-tete",   emoji: "🤯", label: "Mal à la tête",  speech: "J'ai mal à la tête" },
      { id: "mal-ventre", emoji: "🤢", label: "Mal au ventre",  speech: "J'ai mal au ventre" },
      { id: "mal-gorge",  emoji: "😷", label: "Mal à la gorge", speech: "J'ai mal à la gorge" },
      { id: "chaud",      emoji: "🥵", label: "J'ai chaud",     speech: "J'ai chaud" },
      { id: "froid",      emoji: "🥶", label: "J'ai froid",     speech: "J'ai froid" },
      { id: "malade",     emoji: "🤒", label: "Je suis malade", speech: "Je suis malade" },
    ],
  },
];

const CATEGORIES = [
  {
    id: "vouloir", label: "✅ Je veux / Je veux pas", color: "#FF6B6B", bg: "#FFF0F0",
    items: [
      { id: "je-veux",    emoji: "✅", label: "Je veux",       speech: "Je veux" },
      { id: "je-veux-pas",emoji: "❌", label: "Je veux pas",   speech: "Je ne veux pas" },
      { id: "oui",        emoji: "👍", label: "Oui",           speech: "Oui" },
      { id: "non",        emoji: "👎", label: "Non",           speech: "Non" },
      { id: "aide",       emoji: "🙋", label: "Aide-moi",      speech: "Aide-moi s'il te plaît" },
      { id: "attends",    emoji: "✋", label: "Attends",       speech: "Attends s'il te plaît" },
      { id: "encore",     emoji: "🔁", label: "Encore",        speech: "Encore" },
      { id: "fini",       emoji: "🏁", label: "C'est fini",    speech: "C'est fini" },
      { id: "stop",       emoji: "🛑", label: "Stop",          speech: "Stop" },
      { id: "stp",        emoji: "🙏", label: "S'il te plaît", speech: "S'il te plaît" },
      { id: "merci",      emoji: "😁", label: "Merci",         speech: "Merci" },
      { id: "bonjour",    emoji: "👋", label: "Bonjour",       speech: "Bonjour" },
    ],
  },
  {
    id: "besoins", label: "💧 Mes besoins", color: "#4ECDC4", bg: "#F0FFFE",
    items: [
      { id: "manger",     emoji: "🍽️", label: "Manger",       speech: "Je veux manger" },
      { id: "boire",      emoji: "🥤", label: "Boire",         speech: "Je veux boire" },
      { id: "dormir",     emoji: "😴", label: "Dormir",        speech: "Je veux dormir" },
      { id: "toilettes",  emoji: "🚽", label: "Toilettes",     speech: "J'ai besoin d'aller aux toilettes" },
      { id: "bain",       emoji: "🛁", label: "Bain",          speech: "Je veux prendre un bain" },
      { id: "medicament", emoji: "💊", label: "Médicament",    speech: "J'ai besoin de mon médicament" },
      { id: "calin",      emoji: "🤗", label: "Câlin",         speech: "Je veux un câlin" },
      { id: "seul",       emoji: "🧘", label: "Seul svp",      speech: "Je veux être seul s'il te plaît" },
      { id: "couverture", emoji: "🛋️", label: "Couverture",   speech: "Je veux ma couverture" },
      { id: "doudou",     emoji: "🧸", label: "Mon doudou",    speech: "Je veux mon doudou" },
      { id: "casque",     emoji: "🎧", label: "Mon casque",    speech: "Je veux mon casque" },
      { id: "lunettes",   emoji: "🕶️", label: "Mes lunettes", speech: "Je veux mes lunettes" },
    ],
  },
  {
    id: "activites", label: "🎨 Activités & Créativité", color: "#A78BFA", bg: "#F5F0FF",
    items: [
      { id: "jouer",     emoji: "🎮", label: "Jouer",      speech: "Je veux jouer" },
      { id: "lire",      emoji: "📚", label: "Lire",       speech: "Je veux lire" },
      { id: "tv",        emoji: "📺", label: "Télévision", speech: "Je veux regarder la télévision" },
      { id: "musique",   emoji: "🎵", label: "Musique",    speech: "Je veux écouter de la musique" },
      { id: "dessin",    emoji: "✏️", label: "Dessiner",   speech: "Je veux dessiner" },
      { id: "peinture",  emoji: "🎨", label: "Peindre",    speech: "Je veux faire de la peinture" },
      { id: "puzzle",    emoji: "🧩", label: "Puzzle",     speech: "Je veux faire un puzzle" },
      { id: "devoirs",   emoji: "📝", label: "Devoirs",    speech: "Je veux faire mes devoirs" },
      { id: "cuisiner",  emoji: "👨‍🍳", label: "Cuisiner", speech: "Je veux cuisiner" },
      { id: "jardiner",  emoji: "🌱", label: "Jardiner",   speech: "Je veux jardiner" },
      { id: "construire",emoji: "🧱", label: "Construire", speech: "Je veux construire" },
      { id: "bricoler",  emoji: "🔨", label: "Bricoler",   speech: "Je veux bricoler" },
    ],
  },
  {
    id: "sports", label: "⚽ Sports & Plein air", color: "#34D399", bg: "#F0FFF9",
    items: [
      { id: "promenade",   emoji: "🚶", label: "Promenade",    speech: "Je veux aller en promenade" },
      { id: "velo",        emoji: "🚲", label: "Vélo",         speech: "Je veux faire du vélo" },
      { id: "football",    emoji: "⚽", label: "Football",     speech: "Je veux jouer au football" },
      { id: "natation",    emoji: "🏊", label: "Natation",     speech: "Je veux faire de la natation" },
      { id: "gym",         emoji: "🤸", label: "Gym",          speech: "Je veux faire de la gym" },
      { id: "danse",       emoji: "💃", label: "Danser",       speech: "Je veux danser" },
      { id: "basket",      emoji: "🏀", label: "Basket",       speech: "Je veux jouer au basket" },
      { id: "tennis",      emoji: "🎾", label: "Tennis",       speech: "Je veux jouer au tennis" },
      { id: "trampoline",  emoji: "🤸‍♂️",label: "Trampoline", speech: "Je veux faire du trampoline" },
      { id: "escalade",    emoji: "🧗", label: "Escalade",     speech: "Je veux faire de l'escalade" },
      { id: "course",      emoji: "🏃", label: "Courir",       speech: "Je veux courir" },
      { id: "patins",      emoji: "⛸️", label: "Patins",      speech: "Je veux faire des patins" },
    ],
  },
  {
    id: "endroits", label: "🗺️ Où je vais", color: "#F97316", bg: "#FFF7F0",
    items: [
      { id: "maison",      emoji: "🏠", label: "Maison",        speech: "Je veux aller à la maison" },
      { id: "ecole",       emoji: "🏫", label: "École",         speech: "Je vais à l'école" },
      { id: "parc",        emoji: "🌳", label: "Parc",          speech: "Je veux aller au parc" },
      { id: "magasin",     emoji: "🛒", label: "Magasin",       speech: "Je veux aller au magasin" },
      { id: "boulangerie", emoji: "🥖", label: "Boulangerie",   speech: "Je veux aller à la boulangerie" },
      { id: "piscine",     emoji: "🏊", label: "Piscine",       speech: "Je veux aller à la piscine" },
      { id: "docteur",     emoji: "👨‍⚕️",label: "Docteur",     speech: "Je vais chez le docteur" },
      { id: "hopital",     emoji: "🏥", label: "Hôpital",       speech: "Je vais à l'hôpital" },
      { id: "restaurant",  emoji: "🍴", label: "Restaurant",    speech: "Je veux aller au restaurant" },
      { id: "cinema",      emoji: "🎬", label: "Cinéma",        speech: "Je veux aller au cinéma" },
      { id: "voiture",     emoji: "🚗", label: "Voiture",       speech: "Je vais en voiture" },
      { id: "biblio",      emoji: "📚", label: "Bibliothèque",  speech: "Je veux aller à la bibliothèque" },
    ],
  },
  {
    id: "nourriture", label: "🍽️ Ce que je mange", color: "#FF6B9D", bg: "#FFF0F7",
    items: [
      { id: "pain",     emoji: "🍞", label: "Pain",      speech: "Je veux du pain" },
      { id: "fruits",   emoji: "🍎", label: "Fruits",    speech: "Je veux des fruits" },
      { id: "legumes",  emoji: "🥦", label: "Légumes",   speech: "Je veux des légumes" },
      { id: "eau",      emoji: "💧", label: "Eau",       speech: "Je veux de l'eau" },
      { id: "lait",     emoji: "🥛", label: "Lait",      speech: "Je veux du lait" },
      { id: "pizza",    emoji: "🍕", label: "Pizza",     speech: "Je veux de la pizza" },
      { id: "pates",    emoji: "🍝", label: "Pâtes",     speech: "Je veux des pâtes" },
      { id: "gateau",   emoji: "🎂", label: "Gâteau",    speech: "Je veux un gâteau" },
      { id: "yaourt",   emoji: "🍦", label: "Yaourt",    speech: "Je veux un yaourt" },
      { id: "cereales", emoji: "🥣", label: "Céréales",  speech: "Je veux des céréales" },
      { id: "soupe",    emoji: "🍲", label: "Soupe",     speech: "Je veux de la soupe" },
      { id: "chocolat", emoji: "🍫", label: "Chocolat",  speech: "Je veux du chocolat" },
    ],
  },
];

const ROUTINE_ITEMS = [
  { id: "lever",      emoji: "🌅", label: "Se lever",          period: "matin" },
  { id: "habiller",   emoji: "👕", label: "S'habiller",        period: "matin" },
  { id: "petit-dej",  emoji: "🥣", label: "Petit-déjeuner",    period: "matin" },
  { id: "dents-matin",emoji: "🦷", label: "Brosser les dents", period: "matin" },
  { id: "medicament-m",emoji:"💊", label: "Médicament",        period: "matin" },
  { id: "ecole",      emoji: "🏫", label: "École / Activité",  period: "matin" },
  { id: "dejeuner",   emoji: "🍽️", label: "Déjeuner",         period: "aprem" },
  { id: "repos",      emoji: "😴", label: "Repos / Sieste",    period: "aprem" },
  { id: "jeux",       emoji: "🎮", label: "Jeux / Activité",   period: "aprem" },
  { id: "gouter",     emoji: "🍪", label: "Goûter",            period: "aprem" },
  { id: "devoirs",    emoji: "📝", label: "Devoirs",           period: "aprem" },
  { id: "promenade",  emoji: "🚶", label: "Promenade / Sport", period: "aprem" },
  { id: "diner",      emoji: "🍜", label: "Dîner",             period: "soir" },
  { id: "bain-soir",  emoji: "🛁", label: "Bain / Douche",     period: "soir" },
  { id: "dents-soir", emoji: "🦷", label: "Brosser les dents", period: "soir" },
  { id: "pyjama",     emoji: "🌙", label: "Pyjama",            period: "soir" },
  { id: "medicament-s",emoji:"💊", label: "Médicament",        period: "soir" },
  { id: "histoire",   emoji: "📖", label: "Histoire / Lecture",period: "soir" },
  { id: "coucher",    emoji: "🛏️", label: "Se coucher",       period: "soir" },
];

const PERIODS = [
  { id: "matin", label: "🌤️ Matin",      color: "#F59E0B" },
  { id: "aprem", label: "☀️ Après-midi", color: "#F97316" },
  { id: "soir",  label: "🌙 Soir",        color: "#7C3AED" },
];

const ROLES  = ["Papa","Maman","Grand-parent","Frère / Sœur","Soignant","Médecin","Éducateur","Autre"];
const COLORS = ["#FF6B9D","#FF6B6B","#4ECDC4","#FFD93D","#A78BFA","#34D399","#F97316","#60A5FA"];

// ─── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]           = useState("pictos");
  const [activeCategory, setActiveCategory] = useState("vouloir");
  const [activeEmotionGroup, setActiveEmotionGroup] = useState("positives");
  const [message, setMessage]               = useState([]);
  const [routine, setRoutine]               = useState({});
  const [famille, setFamille]               = useState([
    { id: 1, nom: "Maman", role: "Maman", couleur: "#FF6B9D", initiales: "MA", photo: null },
    { id: 2, nom: "Papa",  role: "Papa",  couleur: "#4ECDC4", initiales: "PA", photo: null },
  ]);
  const [showAddMember, setShowAddMember]   = useState(false);
  const [newMember, setNewMember]           = useState({ nom: "", role: "Papa", couleur: "#FF6B9D" });
  const [sentTo, setSentTo]                 = useState(null);
  const [messageSent, setMessageSent]       = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [speaking, setSpeaking]             = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const fileInputRef = useRef(null);

  const speakItem = useCallback((item) => {
    setSpeaking(item.id);
    speak(item.speech || item.label);
    setTimeout(() => setSpeaking(null), 1600);
  }, []);

  const addToMessage = (item) => {
    speakItem(item);
    setTimeout(() => setMessage((prev) => [...prev, item]), 80);
  };

  const speakFullMessage = () => {
    if (!message.length) return;
    speak(message.map((i) => i.speech || i.label).join(", "));
  };

  const sendMessage = () => {
    if (!message.length || !selectedContact) return;
    speakFullMessage();
    setMessageSent(true); setSentTo(selectedContact);
    setTimeout(() => { setMessageSent(false); setMessage([]); setSelectedContact(null); }, 3200);
  };

  const toggleRoutine = (id, val) =>
    setRoutine((p) => ({ ...p, [id]: p[id] === val ? null : val }));

  const addFamilyMember = () => {
    if (!newMember.nom.trim()) return;
    setFamille((p) => [...p, { id: Date.now(), ...newMember, initiales: newMember.nom.trim().slice(0,2).toUpperCase(), photo: null }]);
    setNewMember({ nom: "", role: "Papa", couleur: "#FF6B9D" }); setShowAddMember(false);
  };

  const handlePhotoUpload = (memberId, e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFamille((p) => p.map((m) => m.id === memberId ? { ...m, photo: ev.target.result } : m));
    reader.readAsDataURL(file);
  };

  const cat = CATEGORIES.find((c) => c.id === activeCategory);
  const eGroup = EMOTION_GROUPS.find((g) => g.id === activeEmotionGroup);

  const PictoBtn = ({ item, color, big }) => (
    <button
      onClick={() => big ? speakItem(item) : addToMessage(item)}
      onMouseDown={(e) => { e.currentTarget.style.transform="scale(0.87)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform="scale(1)"; }}
      onTouchStart={(e) => { e.currentTarget.style.transform="scale(0.87)"; }}
      onTouchEnd={(e) => { e.currentTarget.style.transform="scale(1)"; }}
      style={{
        background: speaking === item.id ? color : "white",
        border: `3px solid ${speaking === item.id ? color : color+"33"}`,
        borderRadius: big ? 22 : 17,
        padding: big ? "16px 8px" : "10px 5px",
        cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: big ? 8 : 5,
        boxShadow: speaking === item.id ? `0 5px 18px ${color}66` : "0 2px 9px rgba(0,0,0,0.07)",
        transition: "all 0.15s", fontFamily: "inherit",
        minHeight: big ? 110 : 86, justifyContent: "center",
        transform: speaking === item.id ? "scale(0.95)" : "scale(1)",
      }}>
      <div style={{ fontSize: big ? 46 : 33, lineHeight: 1 }}>{item.emoji}</div>
      <div style={{ fontSize: big ? 13 : 10, fontWeight: 900, color: speaking === item.id ? "white" : "#333", textAlign: "center", lineHeight: 1.2 }}>{item.label}</div>
      {!big && <div style={{ fontSize: 9, color: speaking === item.id ? "rgba(255,255,255,0.8)" : "#BBB", fontWeight: 700 }}>🔊</div>}
      {big && (
        <div style={{
          fontSize: 10, fontWeight: 800,
          color: speaking === item.id ? "rgba(255,255,255,0.9)" : color,
          background: speaking === item.id ? "rgba(255,255,255,0.2)" : color+"18",
          borderRadius: 10, padding: "2px 10px",
        }}>🔊 Je dis ça</div>
      )}
    </button>
  );

  return (
    <div style={{ fontFamily:"'Nunito','Comic Sans MS',cursive,sans-serif", maxWidth:430, margin:"0 auto", background:"#F8F6FF", minHeight:"100vh", display:"flex", flexDirection:"column" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)", padding:"13px 18px 10px", boxShadow:"0 4px 20px rgba(102,126,234,0.4)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:29 }}>🌟</div>
          <div>
            <div style={{ color:"white", fontWeight:900, fontSize:18, lineHeight:1 }}>MonVoix</div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>Mon application de communication</div>
          </div>
          {message.length > 0 && (
            <button onClick={speakFullMessage} style={{ marginLeft:"auto", background:"rgba(255,255,255,0.25)", border:"none", borderRadius:20, padding:"6px 12px", color:"white", fontWeight:900, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              🔊 Lire le message
            </button>
          )}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:82 }}>

        {/* ══ PICTOS ══ */}
        {activeTab === "pictos" && (
          <div>
            <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"11px 13px 8px", scrollbarWidth:"none" }}>
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{ flexShrink:0, padding:"7px 13px", borderRadius:20, border:"none", background:activeCategory===c.id?c.color:"white", color:activeCategory===c.id?"white":"#555", fontWeight:800, fontSize:11, cursor:"pointer", boxShadow:activeCategory===c.id?`0 4px 12px ${c.color}66`:"0 2px 6px rgba(0,0,0,0.08)", transition:"all 0.2s", fontFamily:"inherit" }}>{c.label}</button>
              ))}
            </div>
            <div style={{ margin:"0 13px 10px", padding:"9px 14px", background:cat.bg, borderRadius:12, borderLeft:`4px solid ${cat.color}`, fontWeight:800, fontSize:13, color:cat.color }}>{cat.label}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, padding:"0 13px" }}>
              {cat.items.map((item) => <PictoBtn key={item.id} item={item} color={cat.color} big={false} />)}
            </div>
            <div style={{ margin:"13px", padding:"9px 13px", background:"#EEF2FF", borderRadius:11, fontSize:11, color:"#667eea", fontWeight:700, textAlign:"center" }}>
              👆 Appuie pour parler 🔊 et ajouter au message ✉️
            </div>
          </div>
        )}

        {/* ══ ÉMOTIONS ══ */}
        {activeTab === "emotions" && (
          <div>
            <div style={{ padding:"15px 15px 4px", fontWeight:900, fontSize:19, color:"#333" }}>😊 Comment je me sens ?</div>
            <div style={{ padding:"3px 15px 11px", fontSize:12, color:"#888", fontWeight:700 }}>Appuie sur un visage → ça parle pour toi 🔊</div>

            {/* Onglets groupes */}
            <div style={{ display:"flex", gap:8, padding:"0 13px 12px", overflowX:"auto", scrollbarWidth:"none" }}>
              {EMOTION_GROUPS.map((g) => (
                <button key={g.id} onClick={() => setActiveEmotionGroup(g.id)} style={{ flexShrink:0, padding:"8px 13px", borderRadius:20, border:"none", background:activeEmotionGroup===g.id?g.color:"white", color:activeEmotionGroup===g.id?"white":"#555", fontWeight:800, fontSize:11, cursor:"pointer", boxShadow:activeEmotionGroup===g.id?`0 4px 12px ${g.color}66`:"0 2px 6px rgba(0,0,0,0.08)", transition:"all 0.2s", fontFamily:"inherit" }}>{g.label}</button>
              ))}
            </div>

            {/* Bandeau */}
            <div style={{ margin:"0 13px 14px", padding:"10px 15px", background:eGroup.bg, borderRadius:14, borderLeft:`5px solid ${eGroup.color}`, fontWeight:900, fontSize:14, color:eGroup.color }}>{eGroup.label}</div>

            {/* Grille grande */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:11, padding:"0 13px" }}>
              {eGroup.items.map((item) => <PictoBtn key={item.id} item={item} color={eGroup.color} big={true} />)}
            </div>

            {/* Ajouter au message */}
            <div style={{ padding:"15px 13px 0" }}>
              <div style={{ fontWeight:800, fontSize:12, color:"#AAA", marginBottom:8 }}>Ajouter au message :</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {eGroup.items.map((item) => (
                  <button key={item.id} onClick={() => addToMessage(item)} style={{ padding:"6px 11px", borderRadius:15, border:"none", background:eGroup.bg, color:eGroup.color, fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
                    {item.emoji} {item.label} <span style={{ fontWeight:900 }}>+</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ROUTINE ══ */}
        {activeTab === "routine" && (
          <div style={{ padding:13 }}>
            <div style={{ fontWeight:900, fontSize:18, color:"#333", marginBottom:13 }}>📅 Ma journée d'aujourd'hui</div>
            {PERIODS.map((period) => (
              <div key={period.id} style={{ marginBottom:18 }}>
                <div style={{ fontWeight:900, fontSize:13, color:"white", background:period.color, padding:"8px 14px", borderRadius:12, marginBottom:9, boxShadow:`0 3px 10px ${period.color}55` }}>{period.label}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {ROUTINE_ITEMS.filter((i) => i.period === period.id).map((item) => {
                    const val = routine[item.id];
                    return (
                      <div key={item.id} style={{ background:"white", borderRadius:13, padding:"10px 13px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)", border:val==="oui"?"2.5px solid #34D399":val==="non"?"2.5px solid #FF6B6B":"2.5px solid transparent", transition:"border 0.2s" }}>
                        <div style={{ fontSize:24 }}>{item.emoji}</div>
                        <div style={{ flex:1, fontWeight:800, fontSize:13, color:"#333" }}>{item.label}</div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => toggleRoutine(item.id,"oui")} style={{ width:42, height:42, borderRadius:"50%", border:"none", background:val==="oui"?"#34D399":"#E8F8F1", fontSize:19, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:val==="oui"?"0 3px 10px #34D39966":"none", transition:"all 0.2s" }}>✅</button>
                          <button onClick={() => toggleRoutine(item.id,"non")} style={{ width:42, height:42, borderRadius:"50%", border:"none", background:val==="non"?"#FF6B6B":"#FFF0F0", fontSize:19, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:val==="non"?"0 3px 10px #FF6B6B66":"none", transition:"all 0.2s" }}>❌</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ FAMILLE ══ */}
        {activeTab === "famille" && (
          <div style={{ padding:13 }}>
            <div style={{ fontWeight:900, fontSize:18, color:"#333", marginBottom:13 }}>👨‍👩‍👧 Ma famille & mes soignants</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:11, marginBottom:13 }}>
              {famille.map((m) => (
                <div key={m.id} style={{ background:"white", borderRadius:20, padding:14, display:"flex", flexDirection:"column", alignItems:"center", gap:8, boxShadow:"0 4px 14px rgba(0,0,0,0.09)", position:"relative", border:`3px solid ${m.couleur}33` }}>
                  <button onClick={() => setFamille((p) => p.filter((x) => x.id !== m.id))} style={{ position:"absolute", top:7, right:7, background:"#FFE4E4", border:"none", borderRadius:"50%", width:22, height:22, fontSize:10, cursor:"pointer", color:"#FF6B6B", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                  <div onClick={() => { setEditingMemberId(m.id); fileInputRef.current?.click(); }} style={{ width:74, height:74, borderRadius:"50%", background:m.photo?"transparent":`linear-gradient(135deg,${m.couleur},${m.couleur}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"white", overflow:"hidden", boxShadow:`0 4px 14px ${m.couleur}55`, cursor:"pointer", position:"relative" }}>
                    {m.photo ? <img src={m.photo} alt={m.nom} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : m.initiales}
                    <div style={{ position:"absolute", bottom:0, right:0, background:"rgba(0,0,0,0.5)", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>📷</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontWeight:900, fontSize:14, color:"#333" }}>{m.nom}</div>
                    <div style={{ background:`${m.couleur}22`, color:m.couleur, borderRadius:10, padding:"2px 10px", fontSize:11, fontWeight:800, marginTop:3 }}>{m.role}</div>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowAddMember(true)} style={{ background:"white", borderRadius:20, padding:14, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(0,0,0,0.06)", border:"3px dashed #D1D5DB", cursor:"pointer", minHeight:148, fontFamily:"inherit" }}>
                <div style={{ fontSize:32 }}>➕</div>
                <div style={{ fontWeight:800, fontSize:12, color:"#999" }}>Ajouter</div>
              </button>
            </div>
            {showAddMember && (
              <div style={{ background:"white", borderRadius:20, padding:17, boxShadow:"0 8px 30px rgba(0,0,0,0.12)" }}>
                <div style={{ fontWeight:900, fontSize:15, marginBottom:13 }}>➕ Nouvelle personne</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <input value={newMember.nom} onChange={(e) => setNewMember({...newMember,nom:e.target.value})} placeholder="Prénom (ex : Mamie Jeanne)" style={{ width:"100%", padding:"10px 13px", borderRadius:12, border:"2px solid #E5E7EB", fontSize:14, fontFamily:"inherit", fontWeight:700, outline:"none", boxSizing:"border-box" }} />
                  <select value={newMember.role} onChange={(e) => setNewMember({...newMember,role:e.target.value})} style={{ width:"100%", padding:"10px 13px", borderRadius:12, border:"2px solid #E5E7EB", fontSize:14, fontFamily:"inherit", fontWeight:700, outline:"none", background:"white" }}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                    {COLORS.map((c) => <div key={c} onClick={() => setNewMember({...newMember,couleur:c})} style={{ width:30, height:30, borderRadius:"50%", background:c, cursor:"pointer", border:newMember.couleur===c?"3px solid #333":"3px solid transparent", boxSizing:"border-box" }} />)}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => setShowAddMember(false)} style={{ flex:1, padding:"10px", borderRadius:12, border:"none", background:"#F3F4F6", fontFamily:"inherit", fontWeight:800, fontSize:13, cursor:"pointer" }}>Annuler</button>
                    <button onClick={addFamilyMember} style={{ flex:2, padding:"10px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", fontFamily:"inherit", fontWeight:800, fontSize:13, cursor:"pointer" }}>✅ Ajouter</button>
                  </div>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => editingMemberId && handlePhotoUpload(editingMemberId, e)} />
          </div>
        )}

        {/* ══ MESSAGE ══ */}
        {activeTab === "message" && (
          <div style={{ padding:13 }}>
            <div style={{ fontWeight:900, fontSize:18, color:"#333", marginBottom:13 }}>✉️ Mon message</div>
            <div style={{ background:"white", borderRadius:20, padding:13, minHeight:108, boxShadow:"0 4px 14px rgba(0,0,0,0.08)", marginBottom:9, border:"3px solid #EEF2FF" }}>
              {message.length === 0
                ? <div style={{ color:"#CCC", fontWeight:700, textAlign:"center", paddingTop:15, fontSize:12 }}><div style={{ fontSize:36, marginBottom:6 }}>💬</div>Appuie sur des pictogrammes pour créer ton message !</div>
                : <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {message.map((item,i) => (
                      <div key={i} onClick={() => setMessage((p) => p.filter((_,j)=>j!==i))} style={{ background:"#EEF2FF", borderRadius:12, padding:"6px 10px", display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", position:"relative" }}>
                        <div style={{ fontSize:24 }}>{item.emoji}</div>
                        <div style={{ fontSize:10, fontWeight:800, color:"#667eea" }}>{item.label}</div>
                        <div style={{ position:"absolute", top:-5, right:-5, background:"#FF6B6B", color:"white", borderRadius:"50%", width:15, height:15, fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>✕</div>
                      </div>
                    ))}
                  </div>
              }
            </div>
            {message.length > 0 && (
              <div style={{ display:"flex", gap:8, marginBottom:13 }}>
                <button onClick={speakFullMessage} style={{ flex:1, padding:"10px", borderRadius:12, border:"none", background:"#EEF2FF", color:"#667eea", fontFamily:"inherit", fontWeight:800, fontSize:12, cursor:"pointer" }}>🔊 Lire à voix haute</button>
                <button onClick={() => setMessage([])} style={{ flex:1, padding:"10px", borderRadius:12, border:"none", background:"#FFF0F0", color:"#FF6B6B", fontFamily:"inherit", fontWeight:800, fontSize:12, cursor:"pointer" }}>🗑️ Effacer</button>
              </div>
            )}
            <div style={{ fontWeight:900, fontSize:14, color:"#333", marginBottom:8 }}>📲 Envoyer à :</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:17 }}>
              {famille.map((m) => (
                <button key={m.id} onClick={() => setSelectedContact(m)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:20, border:"none", background:selectedContact?.id===m.id?m.couleur:"white", color:selectedContact?.id===m.id?"white":"#333", fontFamily:"inherit", fontWeight:800, fontSize:12, cursor:"pointer", boxShadow:selectedContact?.id===m.id?`0 4px 12px ${m.couleur}66`:"0 2px 8px rgba(0,0,0,0.08)", transition:"all 0.2s" }}>
                  <div style={{ width:25, height:25, borderRadius:"50%", background:m.photo?"transparent":m.couleur+"44", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:selectedContact?.id===m.id?"white":m.couleur }}>
                    {m.photo ? <img src={m.photo} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={m.nom} /> : m.initiales}
                  </div>
                  {m.nom}
                </button>
              ))}
            </div>
            <button onClick={sendMessage} disabled={!message.length||!selectedContact} style={{ width:"100%", padding:"14px", borderRadius:17, border:"none", background:message.length&&selectedContact?"linear-gradient(135deg,#667eea,#764ba2)":"#E5E7EB", color:message.length&&selectedContact?"white":"#9CA3AF", fontFamily:"inherit", fontWeight:900, fontSize:16, cursor:message.length&&selectedContact?"pointer":"not-allowed", boxShadow:message.length&&selectedContact?"0 6px 20px rgba(102,126,234,0.45)":"none", transition:"all 0.3s" }}>📨 Envoyer le message</button>
            <button onClick={() => setActiveTab("pictos")} style={{ width:"100%", padding:"10px", borderRadius:12, border:"none", background:"#EEF2FF", color:"#667eea", fontFamily:"inherit", fontWeight:800, fontSize:13, cursor:"pointer", marginTop:9 }}>← Retour aux pictogrammes</button>
          </div>
        )}
      </div>

      {/* OVERLAY ENVOYÉ */}
      {messageSent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"white", borderRadius:28, padding:"36px 28px", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <div style={{ fontSize:66, marginBottom:12 }}>🎉</div>
            <div style={{ fontWeight:900, fontSize:20, color:"#333", marginBottom:6 }}>Message envoyé !</div>
            <div style={{ fontWeight:700, fontSize:13, color:"#667eea" }}>{sentTo?.nom} a bien reçu ton message !</div>
          </div>
        </div>
      )}

      {/* NAV BAS */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"white", borderTop:"1px solid #E5E7EB", display:"flex", boxShadow:"0 -4px 20px rgba(0,0,0,0.1)", zIndex:100 }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex:1, padding:"9px 2px 10px", border:"none", background:"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontFamily:"inherit", position:"relative" }}>
            {activeTab===tab.id && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:34, height:3, borderRadius:"0 0 4px 4px", background:"linear-gradient(135deg,#667eea,#764ba2)" }} />}
            <div style={{ fontSize:19 }}>{tab.icon}</div>
            <div style={{ fontSize:9, fontWeight:800, color:activeTab===tab.id?"#667eea":"#9CA3AF" }}>
              {tab.id==="pictos"?"Parler":tab.id==="emotions"?"Je sens":tab.id==="routine"?"Journée":tab.id==="famille"?"Famille":"Message"}
            </div>
            {tab.id==="message"&&message.length>0&&<div style={{ position:"absolute", top:5, right:"50%", transform:"translateX(12px)", background:"#FF6B6B", color:"white", borderRadius:"50%", width:14, height:14, fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>{message.length}</div>}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }
        *{-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
