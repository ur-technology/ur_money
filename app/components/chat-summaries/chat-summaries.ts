import { Component } from '@angular/core';


@Component({
  selector: 'chat-summaries',
  templateUrl: 'build/components/chat-summaries/chat-summaries.html'
})
export class ChatSummaries {

  text: string;

  constructor() {
    this.text = 'Hello World';
  }
}
