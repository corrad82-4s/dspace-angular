import { URLCombiner } from '../core/url-combiner/url-combiner';
import { getAdminModuleRoute } from '../app-routing-paths';

export const REGISTRIES_MODULE_PATH = 'registries';
export const NOTIFICATIONS_MODULE_PATH = 'notifications';
export const INSTITUTIONS_MODULE_PATH = 'institutions';

export function getRegistriesModuleRoute() {
  return new URLCombiner(getAdminModuleRoute(), REGISTRIES_MODULE_PATH).toString();
}

export function getInstitutionsModuleRoute() {
  return new URLCombiner(getAdminModuleRoute(), INSTITUTIONS_MODULE_PATH).toString();
}

export function getNotificationsModuleRoute() {
  return new URLCombiner(getAdminModuleRoute(), NOTIFICATIONS_MODULE_PATH).toString();
}
