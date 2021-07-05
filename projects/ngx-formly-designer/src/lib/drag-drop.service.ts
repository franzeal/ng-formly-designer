import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DragDropService {
  private readonly _dragging = new BehaviorSubject<string>(null);

  get dragging() { return this._dragging.value; }

  get dragging$() {
    return this._dragging.asObservable();
  }

  beginDrag(subject: string): void {
    console.log('drag begin');
    if (subject == null) {
      return;
    }
    console.assert(this._dragging.value === null);
    this._dragging.next(subject);
  }

  endDrag(): void {
    console.log('drag end');
    console.assert(this._dragging.value !== null);
    this._dragging.next(null);
  }
}
