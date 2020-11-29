type History<T> = {
  past: T[];
  present: T | undefined;
  future: T[];
};

export class UndoHistory<T> {
  private depth: number;
  private history: History<T> = { past: [], present: undefined, future: [] };
  constructor(depth: number = 10, initialState: Partial<History<T>> = {}) {
    this.depth = depth;
    this.history.past = initialState?.past || this.history.past;
    this.history.present = initialState?.present || this.history.present;
    this.history.future = initialState?.future || this.history.future;
  }

  getHistory() {
    return this.history;
  }

  undo(steps = 1) {
    if (steps === 0) {
      return this.history.present;
    }
    let nextEl: T | undefined;
    for (let i = 0; i < steps; i++) {
      if (!this.history.past.length) {
        return nextEl;
      }
      if (this.history.present !== undefined) {
        this.history.future.unshift(this.history.present);
      }
      nextEl = this.history.past.pop();
      this.history.present = nextEl;
    }
    return nextEl;
  }

  redo(steps = 1) {
    if (steps === 0) {
      return this.history.present;
    }
    let nextEl: T | undefined;
    for (let i = 0; i < steps; i++) {
      if (!this.history.future.length) {
        return nextEl;
      }
      if (this.history.present !== undefined) {
        this.history.past.push(this.history.present);
      }
      nextEl = this.history.future.shift();
      this.history.present = nextEl;
    }
    return nextEl;
  }

  move(steps: number) {
    return steps > 0 ? this.redo(steps) : this.undo(Math.abs(steps));
  }

  push(el: T) {
    this.history.future = [];
    if (this.history.present !== undefined) {
      this.history.past.push(this.history.present);
    }
    this.history.present = el;
    if (this.history.past.length > this.depth) {
      this.history.past.shift();
    }
  }
}
