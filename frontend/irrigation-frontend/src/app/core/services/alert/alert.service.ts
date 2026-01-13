import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private stompClient!: Client;
  private alertSubject = new Subject<string>();

  connect() {
    this.stompClient = new Client({
  webSocketFactory: () =>
    new SockJS('http://localhost:8082/ws', undefined, {
      transports: ['xhr-streaming', 'xhr-polling']
    }),

  reconnectDelay: 5000,
  debug: str => console.log('[STOMP]', str),

  onConnect: () => {
    console.log('✅ STOMP CONNECTED');

    this.stompClient.subscribe('/topic/alerts', msg => {
      this.alertSubject.next(msg.body);
      console.log('🔔 Alerte reçue:', msg.body);
    });
  }
});


    this.stompClient.activate();
  }

  subscribe(callback: (msg: string) => void) {
    return this.alertSubject.subscribe(callback);
  }

  disconnect() {
    this.stompClient?.deactivate();
  }
}
