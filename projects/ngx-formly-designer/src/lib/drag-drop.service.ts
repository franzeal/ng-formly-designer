import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DragDropService {
  private readonly _dragging = new BehaviorSubject<string>(null);

  get dragging$() {
    return this._dragging.asObservable();
  }

  beginDrag(type: string): void {
    if (type == null) {
      return;
    }
    console.assert(this._dragging.value === null);
    this._dragging.next(type);
  }

  endDrag(): void {
    console.assert(this._dragging.value !== null);
    this._dragging.next(null);
  }
}
