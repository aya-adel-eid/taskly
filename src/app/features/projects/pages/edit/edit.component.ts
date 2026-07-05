import { Component } from '@angular/core';
import { ProjectFormComponent } from "../../components/project-form/project-form.component";

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ProjectFormComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {

}
