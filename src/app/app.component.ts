import { AfterViewInit, Component } from '@angular/core';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { AppConfig } from '../environments/environment';
import { ElectronService } from './core/services/electron.service';
import { LoggingService } from './core/services/logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  isNetworkOnline$: Observable<boolean>;

  constructor(public electronService: ElectronService, logger: LoggingService) {

    logger.info('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      logger.info('Mode electron');
    } else {
      logger.info('Mode web');
    }
    this.isNetworkOnline$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    );
   }

  ngAfterViewInit() {
    this.addListenerForHttpLinks();
  }

  /**
   * This listener will prevent the default behaviour of electron to open http links on electron browser itself.
   * Will use the client's default OS browser to open the link.
   */
  addListenerForHttpLinks() {
    document.addEventListener('click', (event) => {
      const elem = (<HTMLLinkElement>(<HTMLElement>event.target).closest('a[href^="http"]'));
      if (elem) {
        event.preventDefault();
        event.stopPropagation();
        this.electronService.openLink(elem.href);
      }
    }, false);
  }
}
