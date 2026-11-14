import { can } from "../auth/permissions";
import type { Principal } from "./contracts";
export type NavItem={href:string;label:string;icon:string};
export type NavGroup={label:string;items:NavItem[]};
export function navigationFor(principal:Principal):NavGroup[]{
 const groups:NavGroup[]=[
  {label:"PRODUCTS",items:[{href:"/admin",label:"Overview",icon:"grid"},{href:"/admin/apps",label:"Apps & plans",icon:"cube"}]},
  {label:"LICENSING",items:[{href:"/admin/codes",label:"Redeem codes",icon:"key"},{href:"/admin/access",label:"Customer access",icon:"bag"},{href:"/admin/customers",label:"Customers",icon:"person"}]},
 ];
 if(can(principal,"portfolio.write"))groups.push({label:"PORTFOLIO & SALES",items:[{href:"/admin/site",label:"Site editor",icon:"site"},{href:"/admin/projects",label:"Projects & themes",icon:"folder"},{href:"/admin/models",label:"3D models",icon:"cube"},{href:"/admin/orders",label:"Orders",icon:"bag"},{href:"/admin/checkouts",label:"Checkouts",icon:"card"},{href:"/admin/licenses",label:"Legacy keys",icon:"key"},{href:"/admin/portfolio",label:"Portfolio overview",icon:"grid"}]});
 const items=[{href:"/admin/activity",label:"Activity",icon:"activity"},{href:"/admin/settings",label:"Preferences & security",icon:"settings"}];
 if(can(principal,"team.write"))items.unshift({href:"/admin/team",label:"Team & permissions",icon:"person"});
 items.push({href:"/admin/help",label:"Help & onboarding",icon:"help"});groups.push({label:"WORKSPACE",items});return groups;
}
