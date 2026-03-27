'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { initGlobe, addSignalEffect, removeSignalEffect } from './globe'; // Adjust path as necessary
import {
  FaBuilding,
  FaBroadcastTower,
  FaCube,
  FaDatabase,
  FaGamepad,
  FaLinux,
  FaNodeJs,
  FaReact,
  FaRedo,
  FaRobot,
  FaServer,
  FaStore,
  FaTelegramPlane,
  FaUserShield,
  FaUsers,
  FaWallet,
  FaWhatsapp,
  FaWindowMaximize,
} from 'react-icons/fa';
import { BiLogoTypescript } from 'react-icons/bi';
import { MdLocalMall, MdMailOutline } from 'react-icons/md';
import { RiNextjsFill, RiTailwindCssFill } from 'react-icons/ri';
import { SiCss3, SiExpress, SiExpo, SiFlutter, SiJavascript, SiSolidity, SiWebrtc } from 'react-icons/si';
import { TbBrandReactNative, TbBrandSocketIo } from 'react-icons/tb';
import { getOrCreatePlayerIdentity } from './javascript/Utils/playerIdentity.js';
import { createRandomStarterLoadout } from './javascript/Utils/playerLoadout.js';

// Dynamically import the Application component and disable SSR
const Application = dynamic(() => import('./javascript/Application'), {
  ssr: false,
});

const GREETING_ITEMS = [
  'Salam',
  'Merhaba',
  'Privet',
  'Hello',
  'Ciao',
  'Ni Hao',
  'Hola',
  'Bonjour',
  'Namaste',
  'Xin Chao',
  'Neih Hou',
  'Jambo',
  'Pryvit',
  'Oi',
];

const LANGUAGE_OPTIONS = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'ENG' },
] as const;

const MODAL_COPY = {
  en: {
    languageSwitcherLabel: 'Select modal language',
    enterButton: 'ENTER THE PLANET',
    heroTitle: 'Designs & ships digital products that move from brief to revenue.',
    heroCopy: 'Web apps, mobile apps, admin panels, real-time systems, AI workflows, payment flows, and product delivery built around a clear technical task.',
    chips: {
      web: 'Web Apps',
      mobile: 'Mobile Apps',
      backendDesktop: 'Backend Systems',
      backendMobile: 'Backend',
    },
    heroKicker: 'Operational Focus',
    heroMetrics: [
      'Strategy to architecture',
      'Execution across the stack',
      'Launch-ready product delivery',
    ],
    heroNote: 'We build products that are meant to be used, scaled, and remembered, not just presented.',
    highlights: [
      { title: 'Scope', copy: 'We turn rough briefs into a clear build plan.' },
      { title: 'Execution', copy: 'Frontend, backend, integrations, and tooling move as one system.' },
      { title: 'Launch', copy: 'Production readiness matters more than demo polish.' },
    ],
    coreStackTitle: 'Core Stack',
    clientsTitle: 'What Clients Usually Bring',
    clientsCopy: 'A rough brief, a technical task, a Figma file, a half-built product, or an operational bottleneck. We translate that into architecture, implementation, deadline planning, delivery structure, deployment, and iteration. That usually means clarifying priorities, defining what needs to be shipped first, and turning an unclear starting point into a practical path to launch.',
    deliveryTitle: 'Delivery Model',
    deliverySteps: [
      { title: '1. Discovery', copy: 'Clarify goals, constraints, and scope.' },
      { title: '2. Build', copy: 'Implement product, infrastructure, and integrations.' },
      { title: '3. Launch', copy: 'Ship with monitoring, polish, and a path to scale.' },
    ],
    expertiseTitle: 'Our Expertise',
    expertiseIntro: 'Product work usually spans multiple layers. We build the business-facing surface, the operational system behind it, and the infrastructure needed to run it. We mainly focus on writing native code for both frontend and backend to bring high-quality products to life.',
    expertiseItems: [
      {
        title: 'Company page',
        description: 'Clear corporate websites that present the business well, explain the offer, and convert interest into contact.',
      },
      {
        title: 'Landing page',
        description: 'Focused campaign pages built around one conversion goal, fast load time, and strong message hierarchy.',
      },
      {
        title: 'E-commerce',
        description: 'Storefronts, catalog systems, carts, checkout, and admin flows built for sales and repeat use.',
      },
      {
        title: 'Marketplace',
        description: 'Multi-vendor platforms with listings, role separation, moderation, payout logic, and operational tooling.',
      },
      {
        title: 'Social networks',
        description: 'Profiles, feeds, messaging, communities, and social loops designed for retention and interaction.',
      },
      {
        title: 'Multiplayer games',
        description: 'Shared interactive environments with synchronized state, session logic, and real-time player experience.',
      },
      {
        title: 'Backend systems',
        description: 'APIs, databases, queues, admin tooling, and service orchestration designed for stable product operations.',
      },
      {
        title: 'Real-time operations',
        description: 'Live dashboards, socket-driven updates, presence, notifications, and coordination systems that react instantly.',
      },
      {
        title: 'Auth / Payment flow',
        description: 'Identity, access control, subscriptions, payments, and recovery flows built to reduce friction and failure.',
      },
      {
        title: 'VPC servers',
        subtitle: 'private/public subnets',
        description: 'Infrastructure layouts with secure network boundaries, isolated services, and deployable cloud environments.',
      },
      {
        title: 'Smart contracts',
        subtitle: 'Tokenomics',
        description: 'Solidity-based token mechanics, treasury logic, claims, and onchain product rules tied to real user flows.',
      },
      {
        title: 'AI workflows',
        description: 'Task automation, assistants, internal copilots, and AI-powered flows integrated into real product operations.',
      },
    ],
    worldTitle: 'The Inaplanet World',
    worldParagraphs: [
      'Inaplanet is our playable digital world: part arcade, part social space, part live product showcase. We built it to turn a static portfolio into something people can drive through, explore, and feel.',
      'Visitors jump between cities, move through interactive spaces, and experience the project as a living environment instead of a flat page. The goal is to make discovery memorable and give people a world they can enjoy while they explore what we build.',
      'The world is multiplayer, so you can connect with your friends, enter the same city, and enjoy the experience together. To enter the world, use the [ ENTER THE PLANET ] button at the top of the page.',
    ],
    contactTitle: "Have a project in mind? Let's discuss with us.",
    contactCopy: "Reach out directly and we'll turn the brief into scope, architecture, and a build plan.",
    greetingStripAria: 'Greetings in multiple languages',
    greetingLabel: 'Text',
    contactLabels: ['Whatsapp', 'Telegram', 'Mail'],
    footer: 'Inaplanet Foundation. © 2026 | All rights reserved.',
  },
  az: {
    languageSwitcherLabel: 'Modal dilini seçin',
    enterButton: 'PLANETƏ DAXİL OL',
    heroTitle: 'Briefdən gəlirə gedən rəqəmsal məhsulları dizayn edir və təhvil verir.',
    heroCopy: 'Veb tətbiqlər, mobil tətbiqlər, admin panellər, real-time sistemlər, AI iş axınları, ödəniş axınları və aydın texniki tapşırıq ətrafında qurulan məhsul təhvili.',
    chips: {
      web: 'Veb tətbiqlər',
      mobile: 'Mobil tətbiqlər',
      backendDesktop: 'Backend sistemləri',
      backendMobile: 'Backend',
    },
    heroKicker: 'Əməliyyat fokusu',
    heroMetrics: [
      'Strategiyadan arxitekturaya',
      'Bütün stack üzrə icra',
      'Buraxılışa hazır məhsul təhvili',
    ],
    heroNote: 'Biz sadəcə təqdim olunan deyil, istifadə olunan, miqyaslanan və yadda qalan məhsullar qururuq.',
    highlights: [
      { title: 'Əhatə dairəsi', copy: 'Qeyri-müəyyən briefi aydın build planına çeviririk.' },
      { title: 'İcra', copy: 'Frontend, backend, inteqrasiyalar və alətlər bir sistem kimi işləyir.' },
      { title: 'Buraxılış', copy: 'Demo görünüşündən çox production hazırlığı vacibdir.' },
    ],
    coreStackTitle: 'Əsas texnologiyalar',
    clientsTitle: 'Müştərilər adətən nə ilə gəlir',
    clientsCopy: 'Qeyri-dəqiq brief, texniki tapşırıq, Figma faylı, yarımçıq məhsul və ya əməliyyat bottleneck-i ilə. Biz bunu arxitektura, implementasiya, deadline planlaması, təhvil strukturu, deploy və iterasiyaya çeviririk. Bu da adətən prioritetləri aydınlaşdırmaq, əvvəl nəyin çatdırılacağını müəyyən etmək və qeyri-müəyyən başlanğıcı praktik launch yoluna çevirmək deməkdir.',
    deliveryTitle: 'Təhvil modeli',
    deliverySteps: [
      { title: '1. Kəşf', copy: 'Məqsədləri, məhdudiyyətləri və scope-u dəqiqləşdiririk.' },
      { title: '2. Quruluş', copy: 'Məhsulu, infrastrukturu və inteqrasiyaları həyata keçiririk.' },
      { title: '3. Buraxılış', copy: 'Monitorinq, son cilalar və miqyaslanma yolu ilə məhsulu təqdim edirik.' },
    ],
    expertiseTitle: 'Ekspertizamız',
    expertiseIntro: 'Məhsul işi adətən bir neçə təbəqədən ibarət olur. Biz biznesə görünən səthi, arxadakı əməliyyat sistemini və onu işlədən infrastrukturu qururuq. Əsas fokusumuz yüksək keyfiyyətli məhsulları həyata keçirmək üçün həm frontend, həm də backend üçün native code yazmaqdır.',
    expertiseItems: [
      {
        title: 'Şirkət saytı',
        description: 'Biznesi düzgün təqdim edən, təklifi izah edən və marağı əlaqəyə çevirən korporativ saytlar.',
      },
      {
        title: 'Landing page',
        description: 'Bir konversiya məqsədi ətrafında qurulan, sürətli yüklənən və güclü mesaj iyerarxiyası olan səhifələr.',
      },
      {
        title: 'E-commerce',
        description: 'Satış və təkrar istifadə üçün qurulan vitrinlər, kataloq sistemləri, səbət, checkout və admin axınları.',
      },
      {
        title: 'Marketplace',
        description: 'Elanlar, rol ayrımı, moderasiya, payout məntiqi və əməliyyat alətləri olan multi-vendor platformalar.',
      },
      {
        title: 'Sosial şəbəkələr',
        description: 'Retention və interaction üçün qurulan profillər, feed-lər, mesajlaşma, icmalar və sosial dövrlər.',
      },
      {
        title: 'Multiplayer oyunlar',
        description: 'Sinxron vəziyyət, sessiya məntiqi və real-time oyunçu təcrübəsi olan paylaşılmış interaktiv mühitlər.',
      },
      {
        title: 'Backend sistemləri',
        description: 'Stabil məhsul əməliyyatları üçün qurulan API-lər, databazalar, queue-lar, admin alətləri və servis orkestrasyonu.',
      },
      {
        title: 'Real-time əməliyyatlar',
        description: 'Ani reaksiya verən canlı dashboard-lar, socket əsaslı yenilənmələr, presence, bildirişlər və koordinasiya sistemləri.',
      },
      {
        title: 'Auth / Ödəniş axını',
        description: 'Sürtünmə və uğursuzluqları azaltmaq üçün qurulan identity, access control, subscription, payment və recovery axınları.',
      },
      {
        title: 'VPC serverlər',
        subtitle: 'private/public subnetlər',
        description: 'Təhlükəsiz şəbəkə sərhədləri, izolə olunmuş servislər və deploy edilə bilən cloud mühitləri ilə infrastruktur quruluşu.',
      },
      {
        title: 'Ağıllı müqavilələr',
        subtitle: 'Tokenomics',
        description: 'Real istifadəçi axınlarına bağlı token mexanikası, treasury məntiqi, claim-lər və onchain məhsul qaydaları.',
      },
      {
        title: 'AI iş axınları',
        description: 'Real məhsul əməliyyatlarına inteqrasiya olunan task automation, assistant-lar, daxili copilots və AI əsaslı axınlar.',
      },
    ],
    worldTitle: 'Inaplanet Dünyası',
    worldParagraphs: [
      'Inaplanet bizim oynanıla bilən rəqəmsal dünyamızdır: bir hissəsi arcade, bir hissəsi social space, bir hissəsi isə canlı product showcase-dir. Biz bunu statik portfolionu insanların içində sürə, araşdıra və hiss edə biləcəyi bir təcrübəyə çevirmək üçün qurduq.',
      'Ziyarətçilər şəhərlər arasında keçir, interaktiv məkanlardan keçir və layihəni düz səhifə kimi deyil, yaşayan mühit kimi təcrübədən keçirirlər. Məqsəd kəşfi yadda qalan etmək və insanlara qurduqlarımızı araşdırarkən zövq ala biləcəkləri bir dünya təqdim etməkdir.',
      'Dünya multiplayer-dir, buna görə dostlarınızla qoşula, eyni şəhərə daxil ola və təcrübəni birlikdə yaşaya bilərsiniz. Daxil olmaq üçün səhifənin yuxarısındakı [ PLANETƏ DAXİL OL ] düyməsindən istifadə edin.',
    ],
    contactTitle: 'Layihə ideyanız var? Gəlin müzakirə edək.',
    contactCopy: 'Birbaşa yazın və biz briefi scope-a, arxitekturaya və build planına çevirək.',
    greetingStripAria: 'Müxtəlif dillərdə salamlar',
    greetingLabel: 'Yaz',
    contactLabels: ['Whatsapp', 'Telegram', 'E-poçt'],
    footer: 'Inaplanet Foundation. © 2026 | Bütün hüquqlar qorunur.',
  },
  ru: {
    languageSwitcherLabel: 'Выберите язык модального окна',
    enterButton: 'ВОЙТИ В ПЛАНЕТУ',
    heroTitle: 'Проектирует и запускает цифровые продукты, которые ведут от брифа к выручке.',
    heroCopy: 'Веб-приложения, мобильные приложения, админ-панели, real-time системы, AI-процессы, платежные сценарии и продуктовая поставка вокруг четкой технической задачи.',
    chips: {
      web: 'Веб-приложения',
      mobile: 'Мобильные приложения',
      backendDesktop: 'Бэкенд-системы',
      backendMobile: 'Бэкенд',
    },
    heroKicker: 'Операционный фокус',
    heroMetrics: [
      'От стратегии к архитектуре',
      'Исполнение по всему стеку',
      'Поставка продукта, готового к запуску',
    ],
    heroNote: 'Мы создаем продукты, которыми пользуются, которые масштабируются и запоминаются, а не просто показываются.',
    highlights: [
      { title: 'Scope', copy: 'Мы превращаем сырой бриф в понятный build plan.' },
      { title: 'Исполнение', copy: 'Frontend, backend, интеграции и инструменты движутся как одна система.' },
      { title: 'Запуск', copy: 'Готовность к production важнее, чем просто эффектный демо-вид.' },
    ],
    coreStackTitle: 'Основной стек',
    clientsTitle: 'С чем обычно приходят клиенты',
    clientsCopy: 'С сырым брифом, техническим заданием, файлом Figma, наполовину собранным продуктом или операционным bottleneck. Мы переводим это в архитектуру, реализацию, планирование сроков, структуру поставки, деплой и итерации. Обычно это означает прояснить приоритеты, определить, что нужно выпустить в первую очередь, и превратить неясную стартовую точку в практический путь к запуску.',
    deliveryTitle: 'Модель поставки',
    deliverySteps: [
      { title: '1. Discovery', copy: 'Уточняем цели, ограничения и scope.' },
      { title: '2. Build', copy: 'Реализуем продукт, инфраструктуру и интеграции.' },
      { title: '3. Launch', copy: 'Выпускаем продукт с мониторингом, полировкой и путем к масштабированию.' },
    ],
    expertiseTitle: 'Наша экспертиза',
    expertiseIntro: 'Работа над продуктом обычно охватывает несколько слоев. Мы строим пользовательскую поверхность, операционную систему за ней и инфраструктуру, которая все это поддерживает. Наш основной фокус — писать native code и для frontend, и для backend, чтобы запускать продукты максимального качества.',
    expertiseItems: [
      {
        title: 'Сайт компании',
        description: 'Понятные корпоративные сайты, которые хорошо представляют бизнес, объясняют предложение и превращают интерес в контакт.',
      },
      {
        title: 'Landing page',
        description: 'Фокусные страницы под одну конверсионную цель, с быстрой загрузкой и сильной иерархией сообщений.',
      },
      {
        title: 'E-commerce',
        description: 'Витрины, каталоги, корзины, checkout и admin-потоки, построенные для продаж и повторного использования.',
      },
      {
        title: 'Marketplace',
        description: 'Multi-vendor платформы с листингами, разделением ролей, модерацией, payout-логикой и операционными инструментами.',
      },
      {
        title: 'Социальные сети',
        description: 'Профили, ленты, сообщения, сообщества и социальные циклы, спроектированные для retention и interaction.',
      },
      {
        title: 'Мультиплеерные игры',
        description: 'Общие интерактивные среды с синхронизацией состояния, логикой сессий и real-time опытом игроков.',
      },
      {
        title: 'Бэкенд-системы',
        description: 'API, базы данных, очереди, admin-инструменты и оркестрация сервисов для стабильной работы продукта.',
      },
      {
        title: 'Real-time операции',
        description: 'Живые dashboards, обновления через socket, presence, уведомления и системы координации, которые реагируют мгновенно.',
      },
      {
        title: 'Auth / Payment flow',
        description: 'Identity, access control, подписки, платежи и recovery-потоки, построенные так, чтобы снижать трение и сбои.',
      },
      {
        title: 'VPC серверы',
        subtitle: 'private/public subnets',
        description: 'Инфраструктурные схемы с безопасными сетевыми границами, изолированными сервисами и разворачиваемыми cloud-окружениями.',
      },
      {
        title: 'Смарт-контракты',
        subtitle: 'Tokenomics',
        description: 'Solidity-механика токенов, treasury-логика, claims и onchain-правила продукта, связанные с реальными пользовательскими сценариями.',
      },
      {
        title: 'AI workflows',
        description: 'Автоматизация задач, ассистенты, внутренние copilots и AI-потоки, встроенные в реальные продуктовые операции.',
      },
    ],
    worldTitle: 'Мир Inaplanet',
    worldParagraphs: [
      'Inaplanet — это наш игровой цифровой мир: немного arcade, немного social space и немного живой product showcase. Мы построили его, чтобы превратить статичное портфолио в пространство, по которому можно ездить, исследовать и чувствовать.',
      'Посетители перемещаются между городами, проходят через интерактивные пространства и воспринимают проект как живую среду, а не как плоскую страницу. Цель — сделать знакомство запоминающимся и дать людям мир, которым можно наслаждаться, пока они изучают то, что мы создаем.',
      'Этот мир мультиплеерный, поэтому вы можете подключиться с друзьями, войти в один и тот же город и пройти этот опыт вместе. Чтобы войти, используйте кнопку [ ВОЙТИ В ПЛАНЕТУ ] вверху страницы.',
    ],
    contactTitle: 'Есть проект в голове? Давайте обсудим.',
    contactCopy: 'Напишите напрямую, и мы превратим бриф в scope, архитектуру и build plan.',
    greetingStripAria: 'Приветствия на разных языках',
    greetingLabel: 'Скажи',
    contactLabels: ['Whatsapp', 'Telegram', 'Почта'],
    footer: 'Inaplanet Foundation. © 2026 | Все права защищены.',
  },
} as const;

type ModalLanguage = keyof typeof MODAL_COPY;

export default function Home() {
  const MAX_PLAYERS_PER_WORLD = 7;
  const wsRef = useRef<WebSocket | null>(null);
  const landingShowcaseRef = useRef<HTMLDivElement | null>(null);
  const coreStackItems = [
    { label: 'Javascript', icon: <SiJavascript aria-hidden="true" /> },
    { label: 'Typescript', icon: <BiLogoTypescript aria-hidden="true" /> },
    { label: 'Node', icon: <FaNodeJs aria-hidden="true" /> },
    { label: 'Express', icon: <SiExpress aria-hidden="true" /> },
    { label: 'Websocket', icon: <TbBrandSocketIo aria-hidden="true" /> },
    { label: 'WebRTC', icon: <SiWebrtc aria-hidden="true" /> },
    { label: 'CSS', icon: <SiCss3 aria-hidden="true" /> },
    { label: 'Tailwind', icon: <RiTailwindCssFill aria-hidden="true" /> },
    { label: 'React', icon: <FaReact aria-hidden="true" /> },
    { label: 'React Native', icon: <TbBrandReactNative aria-hidden="true" /> },
    { label: 'Expo', icon: <SiExpo aria-hidden="true" /> },
    { label: 'Flutter', icon: <SiFlutter aria-hidden="true" /> },
    { label: 'Linux', icon: <FaLinux aria-hidden="true" /> },
    { label: 'Next.js', icon: <RiNextjsFill aria-hidden="true" /> },
    { label: 'Web3', icon: <FaCube aria-hidden="true" /> },
    { label: 'Solidity', icon: <SiSolidity aria-hidden="true" /> },
    { label: 'WalletConnect Auth', icon: <FaWallet aria-hidden="true" /> },
    { label: 'NFT', icon: <FaCube aria-hidden="true" /> },
    { label: 'Realtime Ops', icon: <FaRedo aria-hidden="true" /> },
  ];
  const expertiseItems = [
    {
      title: 'Company page',
      icon: <FaBuilding aria-hidden="true" />,
      description: 'Clear corporate websites that present the business well, explain the offer, and convert interest into contact.',
    },
    {
      title: 'Landing page',
      icon: <FaWindowMaximize aria-hidden="true" />,
      description: 'Focused campaign pages built around one conversion goal, fast load time, and strong message hierarchy.',
    },
    {
      title: 'E-commerce',
      icon: <MdLocalMall aria-hidden="true" />,
      description: 'Storefronts, catalog systems, carts, checkout, and admin flows built for sales and repeat use.',
    },
    {
      title: 'Marketplace',
      icon: <FaStore aria-hidden="true" />,
      description: 'Multi-vendor platforms with listings, role separation, moderation, payout logic, and operational tooling.',
    },
    {
      title: 'Social networks',
      icon: <FaUsers aria-hidden="true" />,
      description: 'Profiles, feeds, messaging, communities, and social loops designed for retention and interaction.',
    },
    {
      title: 'Multiplayer games',
      icon: <FaGamepad aria-hidden="true" />,
      description: 'Shared interactive environments with synchronized state, session logic, and real-time player experience.',
    },
    {
      title: 'Backend systems',
      icon: <FaDatabase aria-hidden="true" />,
      description: 'APIs, databases, queues, admin tooling, and service orchestration designed for stable product operations.',
    },
    {
      title: 'Real-time operations',
      icon: <FaBroadcastTower aria-hidden="true" />,
      description: 'Live dashboards, socket-driven updates, presence, notifications, and coordination systems that react instantly.',
    },
    {
      title: 'Auth / Payment flow',
      icon: <FaUserShield aria-hidden="true" />,
      description: 'Identity, access control, subscriptions, payments, and recovery flows built to reduce friction and failure.',
    },
    {
      title: 'VPC servers',
      subtitle: 'private/public subnets',
      icon: <FaServer aria-hidden="true" />,
      description: 'Infrastructure layouts with secure network boundaries, isolated services, and deployable cloud environments.',
    },
    {
      title: 'Smart contracts',
      subtitle: 'Tokenomics',
      icon: <FaCube aria-hidden="true" />,
      description: 'Solidity-based token mechanics, treasury logic, claims, and onchain product rules tied to real user flows.',
    },
    {
      title: 'AI workflows',
      icon: <FaRobot aria-hidden="true" />,
      description: 'Task automation, assistants, internal copilots, and AI-powered flows integrated into real product operations.',
    },
  ];
  const contactItems = [
    {
      label: 'Whatsapp',
      href: 'https://wa.me/393515018252',
      icon: <FaWhatsapp aria-hidden="true" />,
    },
    {
      label: 'Telegram',
      href: 'https://t.me/lvnmmdv',
      icon: <FaTelegramPlane aria-hidden="true" />,
    },
    {
      label: 'Mail',
      href: 'mailto:inaplanetfoundation@gmail.com',
      icon: <MdMailOutline aria-hidden="true" />,
    },
  ];
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false); // State for canvas initialization
  const [application, setApplication] = useState(false); // State for canvas initialization
  const [hasAppInitialized, setHasAppInitialized] = useState(false); // Ensure Application is only initialized once
  const [isMounted, setIsMounted] = useState(false); // Track when the component is mounted
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null); // New state for selected world ID
  const [token, setToken] = useState<string | null>(null); // State to store the token
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [language, setLanguage] = useState<ModalLanguage>('en');
  const [activeGreetingIndex, setActiveGreetingIndex] = useState(0);
  const [animatedGreeting, setAnimatedGreeting] = useState('');
  const [isDeletingGreeting, setIsDeletingGreeting] = useState(false);
  const [carName, setCarName] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('selectedCarName');
  });
  // Websocket
  const [matcaps, setMatcaps] = useState({});
  const modalCopy = MODAL_COPY[language];
  const localizedExpertiseItems = modalCopy.expertiseItems.map((item, index) => ({
    icon: expertiseItems[index].icon,
    title: item.title,
    subtitle: 'subtitle' in item ? item.subtitle : undefined,
    description: item.description,
  }));

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8080';

  const worldPlayerCounts = new Map<string, number>(); // To track player counts per worldId
  const applyStarterLoadout = useCallback((playerId: string) => {
    const starterLoadout = createRandomStarterLoadout();

    setCarName(starterLoadout.carName);
    setMatcaps(starterLoadout.matcaps);
    localStorage.setItem('selectedCarName', starterLoadout.carName);
    localStorage.setItem('matcaps', JSON.stringify(starterLoadout.matcaps));

    wsRef.current?.send(
      JSON.stringify({
        type: 'setSelectedCar',
        playerId,
        carName: starterLoadout.carName,
        matcaps: starterLoadout.matcaps,
      })
    );
  }, []);

  const handleReload = () => {
    window.location.reload(); // Reload the page
  };

  useEffect(() => {
    const currentGreeting = GREETING_ITEMS[activeGreetingIndex];
    const normalizedGreeting = animatedGreeting === '\u00A0' ? '' : animatedGreeting;
    const reachedEnd = normalizedGreeting === currentGreeting;
    const reachedStart = normalizedGreeting.length === 0;

    const timeout = window.setTimeout(() => {
      if (!isDeletingGreeting) {
        if (reachedEnd) {
          setIsDeletingGreeting(true);
          return;
        }

        setAnimatedGreeting(currentGreeting.slice(0, normalizedGreeting.length + 1));
        return;
      }

      if (!reachedStart) {
        const nextGreeting = currentGreeting.slice(0, normalizedGreeting.length - 1);
        setAnimatedGreeting(nextGreeting || '\u00A0');
        return;
      }

      setIsDeletingGreeting(false);
      setActiveGreetingIndex((currentIndex) => (currentIndex + 1) % GREETING_ITEMS.length);
    }, reachedEnd && !isDeletingGreeting ? 900 : isDeletingGreeting ? 170 : 310);

    return () => window.clearTimeout(timeout);
  }, [activeGreetingIndex, animatedGreeting, isDeletingGreeting]);

  const openLandingPage = useCallback(() => {
    setShowLandingPage(true);
  }, []);

  const closeLandingPage = useCallback(() => {
    landingShowcaseRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    setShowLandingPage(false);
  }, []);

  const predefinedWorldIds = [
    'Baku', 'New York', 'Tokyo', 'Rome', 'Tel Aviv',
    'New Delhi', 'Munich', 'Florence', 'Beijing', 'Hong Kong',
    'Seoul', 'Los Angeles', 'Paris', 'Las Vegas', 'Istanbul',
    'Reykjavik', 'Doha', 'Moscow', 'Singapore', 'Jakarta',
    'Mexico', 'Madrid', 'Prague', 'Oslo', 'Buenos Aires',
    'Budapest', 'Rio', 'Copenhagen', 'London', 'Dubai',
    'Sydney', 'Accra', 'Hellsinki', 'Dublin', 'Lisbon',
    'Zurich', 'Bogota', 'Melbourne', 'Nairobi', 'Stockholm',
    'Vienna', 'Brussels', 'San Francisco', 'Geneva', 'Cannes',
    'Berlin', 'Havana', 'Montreal', 'Antananarivo', 'Cape Town',
    'Boston', 'Milan', 'Bangkok', 'Mumbai', 'Barcelona',
    'Amsterdam', 'Athens', 'Monaco', 'Venice', 'Peru',
  ];

  // Mapping cities to their corresponding countries
  const cityToFlagMapping: Record<string, string> = {
    'Baku': 'az.svg',
    'New York': 'us.svg',
    'Tokyo': 'jp.svg',
    'Rome': 'it.svg',
    'Tel Aviv': 'il.svg',
    'New Delhi': 'in.svg',
    'Munich': 'de.svg',
    'Florence': 'it.svg',
    'Beijing': 'cn.svg',
    'Hong Kong': 'cn.svg',
    'Seoul': 'kr.svg',
    'Los Angeles': 'us.svg',
    'Paris': 'fr.svg',
    'Las Vegas': 'us.svg',
    'Istanbul': 'tr.svg',
    'Reykjavik': 'is.svg',
    'Doha': 'qa.svg',
    'Moscow': 'ru.svg',
    'Singapore': 'sg.svg',
    'Jakarta': 'id.svg',
    'Mexico': 'mx.svg',
    'Madrid': 'es.svg',
    'Prague': 'cz.svg',
    'Oslo': 'no.svg',
    'Buenos Aires': 'ar.svg',
    'Budapest': 'hu.svg',
    'Rio': 'br.svg',
    'Copenhagen': 'dk.svg',
    'London': 'gb.svg',
    'Dubai': 'ae.svg',
    'Sydney': 'au.svg',
    'Accra': 'gh.svg',
    'Hellsinki': 'fi.svg',
    'Dublin': 'ie.svg',
    'Lisbon': 'pt.svg',
    'Zurich': 'ch.svg',
    'Bogota': 'co.svg',
    'Melbourne': 'au.svg',
    'Nairobi': 'ke.svg',
    'Stockholm': 'se.svg',
    'Vienna': 'at.svg',
    'Brussels': 'be.svg',
    'San Francisco': 'us.svg',
    'Geneva': 'ch.svg',
    'Cannes': 'fr.svg',
    'Berlin': 'de.svg',
    'Havana': 'cu.svg',
    'Montreal': 'ca.svg',
    'Antananarivo': 'mg.svg',
    'Cape Town': 'za.svg',
    'Boston': 'us.svg',
    'Milan': 'it.svg',
    'Bangkok': 'th.svg',
    'Mumbai': 'in.svg',
    'Barcelona': 'es.svg',
    'Amsterdam': 'nl.svg',
    'Athens': 'gr.svg',
    'Monaco': 'mc.svg',
    'Venice': 'it.svg',
    'Peru': 'pe.svg',
  };

  const worldIcons = predefinedWorldIds.map(
    (worldId) => {
      // Check if the worldId exists in the mapping, if not use a default icon (e.g., 'default.svg')
      const flag = cityToFlagMapping[worldId] || 'zz.svg';
      return `/flags/${flag.toLowerCase().replace(/\s+/g, '_')}`;
    }
  );

  const worldLocations: Record<string, { lat: number; lng: number }> = {
    "Baku": { lat: 40.4093, lng: 49.8671 },
    "New York": { lat: 40.7128, lng: -74.0060 },
    "Tokyo": { lat: 35.6764, lng: 139.6500 },
    "Rome": { lat: 41.8967, lng: 12.4822 },
    "Tel Aviv": { lat: 32.0853, lng: 34.7818 },
    "New Delhi": { lat: 28.6139, lng: 77.2088 },
    "Munich": { lat: 48.1351, lng: 11.5820 },
    "Florence": { lat: 43.7700, lng: 11.2577 },
    "Beijing": { lat: 39.9042, lng: 116.4074 },
    "Hong Kong": { lat: 22.3193, lng: 114.1694 },
    "Seoul": { lat: 37.5503, lng: 126.9971 },
    "Los Angeles": { lat: 34.0549, lng: 118.2426 },
    "Paris": { lat: 48.8575, lng: 2.3514 },
    "Las Vegas": { lat: 36.1716, lng: 115.1391 },
    "Istanbul": { lat: 41.0082, lng: 28.9784 },
    "Reykjavik": { lat: 64.1470, lng: 21.9408 },
    "Doha": { lat: 25.2854, lng: 51.5310 },
    "Moscow": { lat: 55.755, lng: 37.6173 },
    "Singapore": { lat: 1.3521, lng: 103.8198 },
    "Jakarta": { lat: 6.1944, lng: 106.8229 },
    "Mexico": { lat: 23.6345, lng: 102.5528 },
    "Madrid": { lat: 40.4167, lng: 3.7033 },
    "Prague": { lat: 50.0755, lng: 14.4378 },
    "Oslo": { lat: 59.9139, lng: 10.7522 },
    "Buenos Aires": { lat: 34.6037, lng: 58.3816 },
    "Budapest": { lat: 47.4979, lng: 19.0402 },
    "Rio": { lat: 22.9068, lng: 43.1729 },
    "Copenhagen": { lat: 55.6761, lng: 12.5683 },
    "London": { lat: 51.5072, lng: 0.1276 },
    "Dubai": { lat: 25.2048, lng: 55.2708 },
    "Sydney": { lat: 33.8688, lng: 151.2093 },
    "Accra": { lat: 5.5593, lng: 0.1974 },
    "Hellsinki": { lat: 60.1699, lng: 24.9384 },
    "Dublin": { lat: 53.3498, lng: 6.2603 },
    "Lisbon": { lat: 38.7223, lng: 9.1393 },
    "Zurich": { lat: 47.3769, lng: 8.5417 },
    "Bogota": { lat: 4.7110, lng: 74.0721 },
    "Melbourne": { lat: 37.8136, lng: 144.9631 },
    "Nairobi": { lat: 1.2921, lng: 36.8219 },
    "Stockholm": { lat: 59.3327, lng: 18.0656 },
    "Vienna": { lat: 48.2081, lng: 16.3713 },
    "Brussels": { lat: 50.8260, lng: 4.3802 },
    "San Francisco": { lat: 37.7749, lng: 122.4194 },
    "Geneva": { lat: 46.2044, lng: 6.1432 },
    "Cannes": { lat: 43.5539, lng: 7.0170 },
    "Berlin": { lat: 52.5200, lng: 13.4050 },
    "Havana": { lat: 23.1339, lng: 82.3586 },
    "Montreal": { lat: 45.5019, lng: 73.5674 },
    "Antananarivo": { lat: 18.9185, lng: 47.5211 },
    "Cape Town": { lat: 33.9221, lng: 18.4231 },
    "Boston": { lat: 42.3601, lng: 71.0589 },
    "Milan": { lat: 45.4685, lng: 9.1824 },
    "Bangkok": { lat: 13.7563, lng: 100.5018 },
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Barcelona": { lat: 41.3874, lng: 2.1686 },
    "Amsterdam": { lat: 52.3676, lng: 4.9041 },
    "Athens": { lat: 37.9838, lng: 23.7275 },
    "Monaco": { lat: 43.7384, lng: 7.4246 },
    "Venice": { lat: 45.4404, lng: 12.3160 },
    "Peru": { lat: 9.1900, lng: 75.0152 },
};

  // Function to get token from the server
  const getToken = async (playerId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token from server');
      }

      const { token } = await response.json(); // Extract token from response
      // localStorage.setItem('token', token); // Store token in localStorage
      sessionStorage.setItem('token', token); // Store token in localStorage
      setToken(token); // Set token in state

      // console.log('Token received and stored:', token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  // Handle disconnection and refresh the page
  // useEffect(() => {
  //   if (!isConnected && hasAppInitialized) {

  //     const userDisplay = document.getElementById('userDisplay');
  //     const batteryStatus = document.getElementById('battery-status');
  //     const scoreElement = document.getElementById('score-status');
  //     const coinMarket = document.getElementById('coin-market');
  //     const inviteButton = document.getElementById('invite-button');
  //     const tradeButton = document.getElementById('trade-button');
  //     const partyElement = document.getElementById('party-info');

  //     if (userDisplay) {
  //       userDisplay.style.display = 'none';
  //     }

  //     console.log('Wallet disconnected, refreshing the page...');
  //     // window.location.reload(); // Refresh the page when the user disconnects
  //     window.location.href = 'https://krashbox.world'
  //   }
  // }, [isConnected, hasAppInitialized]);

  const initializeWebSocket = useCallback((playerId: string) => {

    if (!playerId) {
        console.error("Cannot initialize WebSocket: playerId is missing");
        return;
    }

    if (!sessionStorage.getItem('token')) {
      console.error("Cannot initialize WebSocket: token is missing");
      return;
    }

    if (wsRef.current) {
      // Avoid reinitializing if already connected
      // console.log("WebSocket already initialized");
      return;
    }

    const token = sessionStorage.getItem('token');
    console.log("Session storage", sessionStorage);
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    
    const serverAddress = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
    wsRef.current = new WebSocket(serverAddress);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      updateWorldList(currentCounts);

      if (playerId) {
          applyStarterLoadout(playerId);
      } else {
          console.error('Player ID is missing or invalid');
      }
    };

    wsRef.current.onmessage = (event) => {

      let message;
        try {
            // Parse the message from the WebSocket event
            message = JSON.parse(event.data);
        } catch (error) {
            console.error("Error parsing message:", event.data);
            return;
        }
    
        // Debug log to check the full message structure
        // console.log("Received message:", message);
    
        // Check if the 'counts' property exists
        if (!message.hasOwnProperty('counts')) {
            // console.log("No 'counts' property found in message.");
        } else {
            // console.log("Counts found:", message.counts);
        }

        // Handle `selectedCar` message
        if (message.type === 'selectedCar') {
          // console.log('SelectedCar message received:', message); // Log full message
          if (message.selectedCar) {
              setCarName(message.selectedCar);
              localStorage.setItem('selectedCarName', message.selectedCar);
              // console.log('Selected car set to:', message.selectedCar);
      
              if (message.matcaps) {
                  // console.log('Matcaps before setting state:', message.matcaps); // Log matcaps
                  setMatcaps(message.matcaps);
                  localStorage.setItem('matcaps', JSON.stringify(message.matcaps));
                  // console.log('Matcaps state updated to:', message.matcaps);
              } else {
                  console.warn('No matcaps data received. Defaulting to empty object.');
                  setMatcaps({});
              }
          } else {
              console.warn('No selected car found. Applying starter loadout.');
              if (playerId) {
                applyStarterLoadout(playerId);
              }
          }
      }  

      // User count
      if (message.type === 'playerCount') {
        updatePlayerCount(message.count);
      }
  
      // Handle the 'worldCounts' type message
      if (message.type === 'worldCounts') {
          // Validate counts property
          if (!message.hasOwnProperty('counts') || typeof message.counts !== 'object' || message.counts === null) {
              // console.log("Invalid counts in worldCounts message:", message.counts);
              return;
          }
  
          // Only update the world list if no world has been selected
          if (!selectedWorldId) {
              // console.log("Updating world list with counts:", message.counts);
              updateWorldList(message.counts);

              Object.entries(message.counts).forEach(([worldId, count]) => {
                const location = worldLocations[worldId as keyof typeof worldLocations];
                const previousCount = worldPlayerCounts.get(worldId) || 0; // Get previous count or default to 0
                const newCount = typeof count === 'number' ? count : 0;
            
                // Update the count in the map
                worldPlayerCounts.set(worldId, newCount);
            
                // Add signal if count > 0 and signal doesn't already exist
                if (newCount > 0 && previousCount === 0) {
                    if (location) {
                        // console.log(`Adding signal for ${worldId} at ${location.lat}, ${location.lng}`);
                        addSignalEffect(worldId, location);
                    }
                }
            
                // Remove signal if count becomes 0
                if (newCount === 0 && previousCount > 0) {
                    // console.log(`Removing signal for ${worldId}, no players remaining.`);
                    removeSignalEffect(worldId);
                }
            });            

          } else {
              // console.log("World has already been selected, not updating list.");
          }
  
          // Log the received world counts
          // console.log("Received world counts:", message.counts);
      } else {
          // console.log("Received message of an unexpected type:", message.type);
      }
  };
  

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error, {
        wsBaseUrl: WS_BASE_URL,
        apiBaseUrl: API_BASE_URL,
        hasToken: Boolean(token),
      });
    };

     wsRef.current.onclose = (event) => {
      console.log('WebSocket closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        wsBaseUrl: WS_BASE_URL,
        apiBaseUrl: API_BASE_URL,
      });
      // if (event.code !== 1000) {
      //   console.error('WebSocket closed unexpectedly with code:', event.code);
      //   console.error('Reason:', event.reason);
      // }
      
      // setIsWebSocketReady(false);
    };
    // localStorage.removeItem('token');
    // sessionStorage.removeItem('token');
    // console.log("Session storage", sessionStorage);
  }, [applyStarterLoadout]);

  const handleExitWorld = useCallback(() => {
    window.location.reload();
  }, []);

  let searchQuery = '';

const filterWorlds = (event: React.FormEvent<HTMLInputElement>) => {
  const target = event.target as HTMLInputElement;
  searchQuery = target.value.toLowerCase();
  updateWorldList(currentCounts); // Reapply filtering based on the updated search query
};

let currentCounts: Record<string, number> = {}; // Define the shape of `counts`

const updatePlayerCount = (count: number) => {
  const playerCountElement = document.getElementById('userCountDisplay');
  if (playerCountElement) {
    playerCountElement.innerText = `${count}`;
  }

  const barThresholds = [1, 150, 300, 500];
  const signalBars = document.querySelectorAll('.signal-bars .bar');

  signalBars.forEach((bar, index) => {
    const htmlBar = bar as HTMLElement;
    if (count >= barThresholds[index]) {
      htmlBar.style.opacity = '1';
    } else {
      htmlBar.style.opacity = '0.5';
    }
  });
};

const updateWorldList = (counts: Record<string, number>) => {
  currentCounts = counts; // Store the counts for reuse
  const worldList = document.getElementById('world-list');

  if (worldList) {
    worldList.innerHTML = ''; // Clear existing list items

    predefinedWorldIds
      .filter((worldId) => worldId.toLowerCase().includes(searchQuery)) // Filter worlds by search query
      .forEach((worldId) => {
        const index = predefinedWorldIds.indexOf(worldId); // Get the index for flag lookup
        const playerCount = counts[worldId] || 0; // Default to 0 if no count available

        // Create a list item for the world
        const listItem = document.createElement('li');

        // Create a container div for player count, flag, and world ID
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('content-container');

        // Player count div
        const playerCountDiv = document.createElement('div');
        playerCountDiv.textContent = `${playerCount}/${MAX_PLAYERS_PER_WORLD}`;
        playerCountDiv.classList.add('player-count');

        // Flag div
        const flagDiv = document.createElement('div');
        const flagImg = document.createElement('img');

        // Use cityToFlagMapping to get the correct flag
        const flagFile = cityToFlagMapping[worldId] || 'zz.svg'; // Fallback to default.svg if not found
        flagImg.src = `/flags/${flagFile.toLowerCase().replace(/\s+/g, '_')}`; // Dynamically set the SVG path
        flagImg.alt = `${worldId} flag`;
        flagImg.classList.add('flag-icon');

        flagDiv.appendChild(flagImg);

        // World ID div
        const worldIdDiv = document.createElement('div');
        worldIdDiv.textContent = worldId;
        worldIdDiv.classList.add('world-id');

        // Append components to the content container
        contentContainer.appendChild(playerCountDiv);
        contentContainer.appendChild(flagDiv);
        contentContainer.appendChild(worldIdDiv);

        // Append the content container to the list item
        listItem.appendChild(contentContainer);

        // Apply classes based on selection status
        if (selectedWorldId && selectedWorldId !== worldId) {
          listItem.classList.add('disabled');
        }

        if (selectedWorldId === worldId) {
          listItem.classList.add('selected');
        }

        // Add click event to list item
        listItem.onclick = () => handleWorldSelection(worldId, listItem, worldList);

        // Append the list item to the world list
        worldList.appendChild(listItem);
      });
  }
};

const handleWorldSelection = (worldId: string, listItem: HTMLLIElement, worldList: HTMLElement) => {
  if (!selectedWorldId) {
    setSelectedWorldId(worldId);
    setIsCanvasInitialized(false);
    setApplication(false);
    setTimeout(() => setApplication(true), 500);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Disable all other items visually and clear their onclick events
    Array.from(worldList.children).forEach((item) => {
      const element = item as HTMLElement;
      element.classList.add('disabled');
      element.classList.remove('selected');
      element.onclick = null; // Prevent further clicks
    });

    // Apply 'selected' class to the clicked item
    listItem.classList.remove('disabled');
    listItem.classList.add('selected');
  }
};

    useEffect(() => {
      setIsMounted(true);
      updateWorldList({});

      let localRetryCount = 0;
      const interval = setInterval(() => {
        const container = document.getElementById('loading-layer');
        if (container) {
          initGlobe('loading-layer');
          clearInterval(interval);
        } else if (localRetryCount >= 10) {
          console.warn('Failed to find #loading-layer after 10 retries.');
          clearInterval(interval);
        }
        localRetryCount++;
      }, 150);

      return () => {
        clearInterval(interval);
      };
    }, []);

    useEffect(() => {
      const identity = getOrCreatePlayerIdentity();
      if (!identity?.playerId) {
        return;
      }

      setPlayerId(identity.playerId);
      if (hasAppInitialized) {
        return;
      }

      getToken(identity.playerId)
        .then(() => {
          initializeWebSocket(identity.playerId);
          setHasAppInitialized(true);
          localStorage.removeItem('playerId');
          localStorage.removeItem('worldId');
        })
        .catch((error) => {
          console.error('Error fetching token:', error);
        });
      
    }, [hasAppInitialized, initializeWebSocket]);

    useEffect(() => {
      if (!showLandingPage) {
        return;
      }

      const frame = window.requestAnimationFrame(() => {
        landingShowcaseRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      });

      return () => window.cancelAnimationFrame(frame);
    }, [showLandingPage]);

  if (!isMounted) {
    // Return null on the server (or before the component is mounted on the client)
    return null;
  }

  return (
    <main className="overflow-hidden flex flex-col items-center" style={{ backgroundColor: '#000', fontFamily: "'Orbitron', sans-serif" }}>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

      {!isCanvasInitialized && (
        <div id="loading-container">
          <div id="loading-layer" className="loading-layer overflow-hidden"></div>
          <div id="w3m-layer" className={`w3m-layer flex-container ${showLandingPage ? 'first-screen-hidden' : ''}`}>
            <div className="user-count-wrapper">
              <span id="userCountDisplay" className="user-count-display">0</span>
            </div>
            <button
              type="button"
              className="who-am-i-button"
              onClick={openLandingPage}
            >
              <span className="who-am-i-button__label">WHO WE ARE?</span>
            </button>
          </div>
          {/* Show pulsing message while setting up WebSocket */}
          <>
            <div id="world-layer" className={showLandingPage ? 'first-screen-hidden' : ''}>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  type="text"
                  id="search-bar"
                  placeholder="Search destination..."
                  onInput={(event) => filterWorlds(event)}
                />
                <button
                  onClick={handleReload}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '40px',
                    height: '40px',
                    background: 'none',
                    cursor: 'pointer',
                    // paddingRight: '10px'
                  }}
                >
                  <FaRedo size={12} style={{ color: '#fff' }} />
                </button>
              </div>

              <div className="scroll-container">
                <ul id="world-list"></ul>
              </div>
            </div>
            <section className={`landing-showcase ${showLandingPage ? 'landing-showcase-active' : ''}`}>
              <div className={`landing-showcase__shell ${language === 'en' ? 'landing-showcase__shell--orbitron' : 'landing-showcase__shell--exo'}`}>
                <div className="landing-showcase__topbar">
                  <button
                    type="button"
                    className="landing-showcase__back-button"
                    onClick={closeLandingPage}
                  >
                    <span className="landing-showcase__back-label">{modalCopy.enterButton}</span>
                  </button>
                </div>
                <div ref={landingShowcaseRef} className="landing-showcase__content">
                <div className="landing-showcase__language-switch" role="group" aria-label={modalCopy.languageSwitcherLabel}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      className={`landing-showcase__language-button ${language === option.code ? 'landing-showcase__language-button-active' : ''}`}
                      onClick={() => setLanguage(option.code)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="landing-showcase__body">
                  <div className="landing-showcase__hero">
                    <div className="landing-showcase__hero-copy">
                      <p className="landing-showcase__eyebrow">INAPLANET.COM</p>
                      <h1 className="landing-showcase__title">{modalCopy.heroTitle}</h1>
                      <p className="landing-showcase__copy">{modalCopy.heroCopy}</p>
                      <div className="landing-showcase__chips">
                        <span>{modalCopy.chips.web}</span>
                        <span>{modalCopy.chips.mobile}</span>
                        <span className="landing-showcase__chip-responsive" data-desktop={modalCopy.chips.backendDesktop} data-mobile={modalCopy.chips.backendMobile}></span>
                      </div>
                    </div>
                    <aside className="landing-showcase__hero-panel">
                      <div className="landing-showcase__hero-panel-glow" aria-hidden="true"></div>
                      <span className="landing-showcase__hero-kicker">{modalCopy.heroKicker}</span>
                      <div className="landing-showcase__hero-metrics">
                        {modalCopy.heroMetrics.map((metric, index) => (
                          <div key={metric}>
                            <strong>{`0${index + 1}`}</strong>
                            <span>{metric}</span>
                          </div>
                        ))}
                      </div>
                      <p className="landing-showcase__hero-note">{modalCopy.heroNote}</p>
                    </aside>
                  </div>
                  <div className="landing-showcase__highlights">
                    {modalCopy.highlights.map((item) => (
                      <article key={item.title} className="landing-showcase__card">
                        <h2>{item.title}</h2>
                        <p>{item.copy}</p>
                      </article>
                    ))}
                  </div>
                  <div className="landing-showcase__divider" aria-hidden="true"></div>
                  <div className="landing-showcase__sections">
                    <section className="landing-showcase__section landing-showcase__section--wide">
                    <h2>{modalCopy.coreStackTitle}</h2>
                    <div className="landing-showcase__ticker">
                      <div className="landing-showcase__ticker-track">
                        {[...coreStackItems, ...coreStackItems].map((item, index) => (
                          <span key={`ticker-a-${item.label}-${index}`} className="landing-showcase__skill-item landing-showcase__skill-pill">
                            {item.icon}
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>
                  <div className="landing-showcase__divider" aria-hidden="true"></div>
                  <section className="landing-showcase__section">
                    <h2>{modalCopy.clientsTitle}</h2>
                    <p>{modalCopy.clientsCopy}</p>
                  </section>
                  <section className="landing-showcase__section">
                    <h2>{modalCopy.deliveryTitle}</h2>
                    <div className="landing-showcase__timeline">
                      {modalCopy.deliverySteps.map((step) => (
                        <div key={step.title}>
                          <strong>{step.title}</strong>
                          <p>{step.copy}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="landing-showcase__divider" aria-hidden="true"></div>
                  <section className="landing-showcase__section landing-showcase__section--wide landing-showcase__section--expertise">
                    <h2>{modalCopy.expertiseTitle}</h2>
                    <p>{modalCopy.expertiseIntro}</p>
                    <div className="landing-showcase__expertise-grid">
                      {localizedExpertiseItems.map((item) => (
                        <article key={item.title} className="landing-showcase__expertise-card">
                          <div className="landing-showcase__expertise-head">
                            <span className="landing-showcase__expertise-icon">{item.icon}</span>
                            <div className="landing-showcase__expertise-title-group">
                              <h3>{item.title}</h3>
                              {item.subtitle ? <span>{item.subtitle}</span> : null}
                            </div>
                          </div>
                          <p>{item.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                  <div className="landing-showcase__divider" aria-hidden="true"></div>
                  <section className="landing-showcase__section landing-showcase__section--story">
                    <h2>{modalCopy.worldTitle}</h2>
                    <p>{modalCopy.worldParagraphs[0]}</p>
                    <p className="landing-showcase__story-copy">{modalCopy.worldParagraphs[1]}</p>
                    <p className="landing-showcase__story-copy">{modalCopy.worldParagraphs[2]}</p>
                  </section>
                  <section className="landing-showcase__section landing-showcase__section--contact">
                    <h2>{modalCopy.contactTitle}</h2>
                    <p>{modalCopy.contactCopy}</p>
                    <div className="landing-showcase__greeting-strip" aria-label={modalCopy.greetingStripAria}>
                      {language === 'az' ? (
                        <>
                          <div className="landing-showcase__greeting-typewriter" aria-live="polite">
                            <span>{animatedGreeting}</span>
                            <span className="landing-showcase__greeting-caret" aria-hidden="true"></span>
                          </div>
                          <span className="landing-showcase__greeting-label">{modalCopy.greetingLabel}</span>
                        </>
                      ) : (
                        <>
                          <span className="landing-showcase__greeting-label">{modalCopy.greetingLabel}</span>
                          <div className="landing-showcase__greeting-typewriter" aria-live="polite">
                            <span>{animatedGreeting}</span>
                            <span className="landing-showcase__greeting-caret" aria-hidden="true"></span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="landing-showcase__contact-actions">
                      {contactItems.map((item, index) => (
                        <a
                          key={item.label}
                          className="landing-showcase__back-button landing-showcase__section-button landing-showcase__contact-button"
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                        >
                          <span className="landing-showcase__contact-icon">{item.icon}</span>
                          <span>{modalCopy.contactLabels[index]}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                </div>
                <p className="landing-showcase__footer-note">
                  {modalCopy.footer}
                </p>
                </div>
                </div>
              </div>
            </section>
          </>
        </div>
      )}

      {playerId && selectedWorldId && token && application && (
        <Application playerId={playerId} selectedWorldId={selectedWorldId} token={token} carName={carName} matcaps={matcaps} />
      )}

      {playerId && selectedWorldId && token && application && (
        <div className="grid bg-transparent overflow-hidden shadow-sm">
          <div className="flex justify-center items-center p-4">
            <button type="button" className="game-exit-button" id="game-exit-button" onClick={handleExitWorld} style={{ opacity: 0, display: 'none' }} aria-label="Exit game world">
              &times;
            </button>
            <div id="userDisplay" className="cursor-pointer z-50" style={{ opacity: 0, display: 'none' }}></div>
            <div id="playerCountDisplay"></div>

            {/* Battery Status */}
            <div id="battery-status" className="battery-container">
              <div id="battery-percentage" className="battery-percentage"></div>
              <div className="battery-bar"></div>
            </div>

            {/*Friend List */}
            <div id="contact-list-container">
                <button id="toggle-contact-list" className='toggle-contact-list' style={{ display: 'none', opacity: 0 }}></button>
                <div id="contact-list">
                  <h1 style={{textAlign: 'center', paddingBottom: '10px'}}>CONNECTED LINKS</h1>
                  <button id='toggle-contact' className='toggle-contact'></button>
                </div>
            </div>

            {/*Controller Settings */}
            <div id="settings-container">
                <button id="toggle-settings" className="toggle-settings"></button>
                <div id="settings-window" className='display: block;'>
                  <h1 style={{textAlign: 'center', paddingBottom: '10px'}}>CONTROLLER</h1>
                  <button id='toggle-settings-window' className='toggle-settings-window'></button>
                  <div id='joystick-setup-container' className='joystick-setup-container'>
                    {/* <button id="move-joystick-left"><i data-feather="arrow-down-left"></i> </button> */}
                    {/* <button id="move-joystick-right"><i data-feather="arrow-down-right"></i> </button> */}
                    </div>
                    {/* First div with 8 buttons to drag */}
                    <div id="button-setup" className="customize-button-container">
                        {/*  Create 8 draggable buttons */}
                        <button className="draggable btn1" id="btn1" draggable="true">
                          <div
                              className="button-icon"
                              style={{
                                  backgroundImage: `url('/images/mobile/paperPlane.png')`,
                              }}
                            />
                        </button>
                        <button className="draggable btn2" id="btn2" draggable="true">
                          <div
                              className="button-icon"
                              style={{
                                  backgroundImage: `url('/images/mobile/doubleTriangle.png')`,
                              }}
                              />
                        </button>
                        <button className="draggable btn3" id="btn3" draggable="true">
                          <div
                                className="button-icon"
                                style={{
                                    backgroundImage: `url('/images/mobile/siren.png')`,
                                }}
                              />
                        </button>
                        <button className="draggable btn4" id="btn4" draggable="true">
                          <div
                                  className="button-icon"
                                  style={{
                                      backgroundImage: `url('/images/mobile/triangle.png')`,
                                  }}
                                />
                        </button>
                        <button className="draggable btn5" id="btn5" draggable="true">
                          <div
                                    className="button-icon"
                                    style={{
                                        backgroundImage: `url('/images/mobile/triangle.png')`,
                                        rotate: '180deg'
                                    }}
                                />
                        </button>
                        <button className="draggable btn6" id="btn6" draggable="true">
                          <div
                                    className="button-icon"
                                    style={{
                                        backgroundImage: `url('/images/mobile/cross.png')`,
                                    }}
                                />
                        </button>
                        <button className="draggable btn7" id="btn7" draggable="true">
                          <div
                                      className="button-icon"
                                      style={{
                                          backgroundImage: `url('/images/mobile/warning.png')`,
                                      }}
                                />
                        </button>
                        <button className="draggable btn8" id="btn8" draggable="true">
                          <div
                                        className="button-icon"
                                        style={{
                                            width: '70%',
                                            height: '70%',
                                            backgroundImage: `url('/images/mobile/start.png')`,
                                        }}
                                />
                        </button>
                    </div>

                    {/* Drop area container */}
                    <div id="drop-area" className="drop-container">
                        <div className="drop-slot" id="slot1" data-slot="1">
                            <span className="slot-label">1</span>
                        </div>
                        <div className="drop-slot" id="slot2" data-slot="2">
                            <span className="slot-label">2</span>
                        </div>
                        <div className="drop-slot" id="slot3" data-slot="3">
                            <span className="slot-label">3</span>
                        </div>
                        <div className="drop-slot" id="slot4" data-slot="4">
                            <span className="slot-label">4</span>
                        </div>
                        <div className="drop-slot" id="slot5" data-slot="5">
                            <span className="slot-label">5</span>
                        </div>
                        <div className="drop-slot" id="slot6" data-slot="6">
                            <span className="slot-label">6</span>
                        </div>
                        <div className="drop-slot" id="slot7" data-slot="7">
                            <span className="slot-label">7</span>
                        </div>
                        <div className="drop-slot" id="slot8" data-slot="8">
                            <span className="slot-label">8</span>
                        </div>
                    </div>

                    <div className='flex justify-center'>
                      <button style={{paddingTop: '30px', paddingRight: '10px'}} id="reset-button">RESET</button>
                      <button style={{paddingTop: '30px', paddingLeft: '10px'}} id="save-settings-button">SAVE</button>
                    </div>
                </div>
            </div>

            {/*Popup Window */}
            <div id="no-target-popup" className="popup-container" style={{display: 'none'}}>
              <div className="popup-content">
                <p id="popup-message">Default message</p>
                <button id="ok-button">KK</button>
              </div>
            </div>

            {/* Speedometer */}
            <div id="speedometer">
              <div id="needle"></div>
              <div id="speed-value"></div>
            </div>

            {/* Score Display */}
            <div id="score-status" className="player-score"></div>

            {/* Party Chat */}
            <button id="toggle-party-list" style={{ display: 'none', opacity: 0 }}></button>
            <button id="party-call-button" style={{display: 'none'}}>VOICE</button>
            <button id="toggle-lobby">INBOX</button>
            <div id="party-chat-container" className="chat-box" style={{ display: 'none' }}>
              <div id="party-chat-box" className="chat-box-body"></div>
              <div className="chat-box-footer">
                <input id="party-message-input" type="text" placeholder="Typing..." className="chat-input" />
                <button id="send-message-button" className="send-button">
                  <i data-feather="send"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Hidden UI Elements */}
      <div id="coin-market" style={{ display: 'none', opacity: 0 }}></div>
      <button id="invite-button" style={{ display: 'none', opacity: 0 }}></button>
      <button id="friend-invite-button" style={{ display: 'none', opacity: 0 }}></button>
      <div id="touch-radio" style={{ opacity: 0 }}></div>
      <div id="touch-previous" style={{ opacity: 0 }}></div>
      <div id="touch-next" style={{ opacity: 0 }}></div>
      <div id="touch-mute" style={{ opacity: 0 }}></div>
      <input
        id="touch-slider"
        type="range"
        className="opacity-0"
        min="0"
        max="1"
        step="0.01"
      />
      <div id="score-animation-container"></div>

      {/* Switch Container */}
      <div id="switch-container">
        {/* <div id="switch">
          <div id="switch-toggle"></div>
        </div> */}
      </div>

    </main>
  );
};
