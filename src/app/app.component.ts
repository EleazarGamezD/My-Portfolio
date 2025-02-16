import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BootstrapModule } from './shared/modules/bootstrap/bootstrap.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BootstrapModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'My-Portfolio';
}
