import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VideoCallComponent } from './components/video-call/video-call.component';

@Component({
  imports: [RouterModule, VideoCallComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'fam';
}
