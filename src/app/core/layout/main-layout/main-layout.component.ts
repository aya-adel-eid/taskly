import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { AsidBarService } from '../../services/helper/asid-bar.service';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SideBarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
asidBar=inject(AsidBarService)
}
