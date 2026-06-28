import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { StORED_KEYS } from '../../constants/STORED_KEYS';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
if (req.urlWithParams.includes('signup')||req.urlWithParams.includes('grant_type=password')) {
  req=req.clone({
    setHeaders:{
     apikey:environment.apiKey
    }
  })
  
}
else{
    req=req.clone({
    setHeaders:{
     apikey:environment.apiKey,
       Authorization: `Bearer ${localStorage.getItem(StORED_KEYS.userToken)}`!,
    }
  })
}
  return next(req);
};
