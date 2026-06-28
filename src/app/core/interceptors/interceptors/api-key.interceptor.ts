import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
if (req.urlWithParams.includes('signup')||req.urlWithParams.includes('grant_type=password')) {
  req=req.clone({
    setHeaders:{
     apikey:environment.apiKey
    }
  })
  
}
  return next(req);
};
