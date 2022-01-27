import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ComparismComponent} from './pages/comparism/comparism.component';
import {CreateComponent} from "./pages/create/create.component";

const routes: Routes = [
  {path: 'display', component: ComparismComponent},
  {path: '', component: CreateComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
