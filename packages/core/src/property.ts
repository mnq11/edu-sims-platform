/**
 * Property<T> — خلية حالة قابلة للمراقبة (نمط المراقب).
 * النواة التفاعلية لكل محاكاة: النموذج يغيّر القيمة، والعرض والوصف الصوتي
 * والتقييم يشتركون فيها. مستوحى من نمط Axon لدى PhET بواجهة أبسط.
 */
export type Listener<T> = (value: T, previous: T) => void;

export class Property<T> {
  private listeners = new Set<Listener<T>>();

  constructor(private current: T) {}

  get value(): T {
    return this.current;
  }

  set value(next: T) {
    if (Object.is(next, this.current)) return;
    const previous = this.current;
    this.current = next;
    for (const listener of [...this.listeners]) listener(next, previous);
  }

  /** اشترك بالتغييرات. يعيد دالة إلغاء الاشتراك لمنع تسريب الذاكرة. */
  link(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** اشترك واستدعِ المستمع فوراً بالقيمة الحالية (مزامنة أولية). */
  linkImmediate(listener: Listener<T>): () => void {
    const dispose = this.link(listener);
    listener(this.current, this.current);
    return dispose;
  }

  get listenerCount(): number {
    return this.listeners.size;
  }
}

/** يشتق Property جديدة من property أخرى عبر دالة تحويل نقية. */
export function derived<A, B>(source: Property<A>, map: (value: A) => B): Property<B> {
  const target = new Property(map(source.value));
  source.link((value) => {
    target.value = map(value);
  });
  return target;
}
