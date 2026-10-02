import { Calculator, ChevronDown, Info, Sparkles, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

interface Card {
  id?: string;
  Icon: LucideIcon;
  tone: "primary" | "accent";
  title: string;
  /** One line shown while the card is folded on phones. */
  teaser: string;
  body: ReactNode;
}

const CARDS: Card[] = [
  {
    Icon: Sparkles,
    tone: "primary",
    title: "عن المشروع",
    teaser: "أداة مجانية لتنظيم قضاء الصلوات الفائتة بهدوء ووضوح، وكل شيء يبقى على جهازك.",
    body: (
      <p className="text-muted-foreground leading-loose">
        «خطة القضاء» أداة مجانية لكل من يريد تنظيم قضاء صلواته الفائتة بهدوء ووضوح. لا حساب، ولا خادم، ولا إعلانات؛ كل شيء يبقى
        على جهازك. صُممت لتحوّل رقماً كبيراً مربكاً إلى خطوات صغيرة يمكن إنجازها اليوم.
      </p>
    ),
  },
  {
    Icon: Info,
    tone: "accent",
    title: "قبل أن تبدأ",
    teaser: "أداة تنظيمية وليست خدمة إفتاء؛ عدّل الأعداد والخطة بما يناسب حالتك.",
    body: (
      <p className="text-muted-foreground leading-loose">
        تساعدك هذه الأداة على تقدير وتنظيم صلوات القضاء. قد تختلف بعض الأحكام والتفاصيل حسب الحالة والمذهب أو الفتوى
        التي تتبعها، لذلك يمكنك دائماً تعديل الأعداد والخطة بما يناسب حالتك. هذه أداة تنظيمية وليست خدمة إفتاء. وإن كان لديك سؤال فقهي فاستشر من تثق به من أهل العلم.
      </p>
    ),
  },
  {
    id: "method",
    Icon: Calculator,
    tone: "primary",
    title: "طريقة الحساب",
    teaser: "كيف نقدّر الأيام، ثم الصلوات، ثم مدة الخطة، في ست نقاط.",
    body: (
      <ul className="text-muted-foreground leading-loose list-disc ps-5 space-y-1">
        <li>نحسب عدد الأيام بين تاريخ البلوغ التقريبي وتاريخ الالتزام بالصلاة.</li>
        <li>نطرح الفترات المستثناة التي تحددها وفترات النفاس، مع دمج الفترات المتداخلة.</li>
        <li>إذا فعّلت خيار الحيض، نقدّر أيامه بضرب متوسط الأيام الشهري في عدد أشهر الفترة المتبقية ونطرحها أيضاً.</li>
        <li>كل يوم متبقٍ يُحسب خمس صلوات، ويمكنك بعد ذلك تعديل عدد كل صلاة يدوياً.</li>
        <li>تُحسب صلاة الجمعة ضمن الظهر، ولا تدخل صلاة الوتر ولا السنن في التقدير.</li>
        <li>نقسم المتبقي من كل صلاة على هدفها اليومي، ونقرّب الناتج إلى يوم كامل. أطول مدة هي مدة الخطة، بافتراض تحقيق الأهداف يومياً. إذا بقيت صلاة دون هدف يومي، لا تُحدَّد مدة الخطة.</li>
      </ul>
    ),
  },
];

/** Below Tailwind's `md` (48rem): the cards fold. */
const COMPACT_QUERY = "(max-width: 47.99rem)";

function useCompact() {
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const sync = () => setCompact(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return compact;
}

/** Anchor links into a folded card (footer → #method) must still land on open content. */
function useOpenOnHash(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const open = (hash: string) => {
      const target = hash.startsWith("#") ? document.getElementById(hash.slice(1)) : null;
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    const onHash = () => open(window.location.hash);
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (link) open(link.getAttribute("href") ?? "");
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, [enabled]);
}

function IconTile({ Icon, tone }: Pick<Card, "Icon" | "tone">) {
  const cls = tone === "accent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary";
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cls}`}>
      <Icon className="w-5 h-5" aria-hidden="true" />
    </div>
  );
}

const CARD = "bg-card border border-border rounded-2xl";

/** Phones: a folded card with a teaser; tap to read. */
function FoldedCard({ card }: { card: Card }) {
  return (
    <details id={card.id} className={`group ${CARD} scroll-mt-20`}>
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none flex items-start gap-4 p-5 rounded-2xl hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50">
        <IconTile Icon={card.Icon} tone={card.tone} />
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground">{card.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed group-open:hidden">{card.teaser}</p>
        </div>
        <ChevronDown
          className="w-5 h-5 mt-2.5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5">{card.body}</div>
    </details>
  );
}

/** `md` and up: the card as it has always been. */
function OpenCard({ card }: { card: Card }) {
  return (
    <div id={card.id} className={`${CARD} p-5 md:p-8 flex gap-4 md:gap-5 scroll-mt-20`}>
      <IconTile Icon={card.Icon} tone={card.tone} />
      <div>
        <h3 className="text-xl font-bold text-foreground mb-3">{card.title}</h3>
        {card.body}
      </div>
    </div>
  );
}

export function About() {
  const compact = useCompact();
  useOpenOnHash(compact);
  return (
    <section id="about" className="py-10 md:py-16 bg-secondary/40 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 md:space-y-6">
        {CARDS.map((card) => (compact ? <FoldedCard key={card.title} card={card} /> : <OpenCard key={card.title} card={card} />))}
      </div>
    </section>
  );
}
