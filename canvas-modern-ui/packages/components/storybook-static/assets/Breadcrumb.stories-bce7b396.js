import{a as e,j as h}from"./jsx-runtime-8a1697f2.js";import{r as z}from"./index-8b3efc3f.js";import"./_commonjsHelpers-de833af9.js";const E={dashboard:"Dashboard",courses:"Courses",assignments:"Assignments",grades:"Grades",calendar:"Calendar",discussions:"Discussions",files:"Files",groups:"Groups",notifications:"Notifications",settings:"Settings",analytics:"Analytics",reports:"Reports",admin:"Administration",users:"Users",help:"Help",profile:"Profile",modules:"Modules",pages:"Pages",syllabus:"Syllabus",outcomes:"Outcomes",quizzes:"Quizzes",rubrics:"Rubrics",conferences:"Conferences",collaborations:"Collaborations",inbox:"Inbox"};function _(a){const t=a.split("/").filter(Boolean),o=[{label:"Home",href:"/dashboard"}];let l="";for(const s of t){l+=`/${s}`;const c=E[s]||decodeURIComponent(s);/^\d+$/.test(s)||o.push({label:c,href:l})}return o}function n({items:a,pathname:t,maxItems:o=4,separator:l="›"}){const s=z.useMemo(()=>a||(t?_(t):[]),[a,t]);if(s.length===0)return null;let c=s;return s.length>o&&(c=[s[0],{label:"…"},...s.slice(-(o-2))]),e("nav",{"aria-label":"Breadcrumb",className:"cx-breadcrumb",children:e("ol",{className:"cx-breadcrumb__list",children:c.map((r,f)=>{const g=f===c.length-1;return h("li",{className:"cx-breadcrumb__item",children:[f>0&&e("span",{className:"cx-breadcrumb__separator","aria-hidden":"true",children:l}),g||!r.href?h("span",{className:`cx-breadcrumb__text ${g?"cx-breadcrumb__text--current":""}`,"aria-current":g?"page":void 0,children:[r.icon&&e("span",{className:"cx-breadcrumb__icon",children:r.icon}),r.label]}):h("a",{href:r.href,className:"cx-breadcrumb__link",children:[r.icon&&e("span",{className:"cx-breadcrumb__icon",children:r.icon}),r.label]})]},f)})})})}try{_.displayName="generateBreadcrumbs",_.__docgenInfo={description:"Generate breadcrumb items from a URL pathname",displayName:"generateBreadcrumbs",props:{}}}catch{}try{n.displayName="Breadcrumb",n.__docgenInfo={description:"",displayName:"Breadcrumb",props:{items:{defaultValue:null,description:"",name:"items",required:!1,type:{name:"BreadcrumbItem[]"}},pathname:{defaultValue:null,description:"Auto-generate from current path",name:"pathname",required:!1,type:{name:"string"}},maxItems:{defaultValue:{value:"4"},description:"Max items before collapsing middle items",name:"maxItems",required:!1,type:{name:"number"}},separator:{defaultValue:{value:"›"},description:"",name:"separator",required:!1,type:{name:"ReactNode"}}}}}catch{}const W={title:"Navigation/Breadcrumb",component:n,tags:["autodocs"],argTypes:{maxItems:{control:{type:"number",min:2,max:10}}}},i={args:{items:[{label:"Home",href:"/"},{label:"Courses",href:"/courses"},{label:"Mathematics 101",href:"/courses/101"}]}},m={args:{items:[{label:"Home",href:"/"},{label:"Settings",href:"/settings"}]}},u={args:{pathname:"/courses/101/assignments/42",maxItems:4}},d={args:{items:[{label:"Home",href:"/"},{label:"Courses",href:"/courses"},{label:"Computer Science",href:"/courses/42"},{label:"Assignments",href:"/courses/42/assignments"},{label:"Project 3",href:"/courses/42/assignments/7"}],maxItems:3}},p={args:{items:[{label:"Home",href:"/",icon:e("span",{children:"⌂"})},{label:"Files",href:"/files",icon:e("span",{children:"📁"})},{label:"Documents",icon:e("span",{children:"📄"})}]}},b={render:()=>h("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e(n,{pathname:"/dashboard"}),e(n,{pathname:"/courses/42/assignments/15"}),e(n,{pathname:"/admin/users/roles/permissions"})]})};var x,y,C;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '/'
    }, {
      label: 'Courses',
      href: '/courses'
    }, {
      label: 'Mathematics 101',
      href: '/courses/101'
    }]
  }
}`,...(C=(y=i.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};var D,B,N;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '/'
    }, {
      label: 'Settings',
      href: '/settings'
    }]
  }
}`,...(N=(B=m.parameters)==null?void 0:B.docs)==null?void 0:N.source}}};var S,I,v;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    pathname: '/courses/101/assignments/42',
    maxItems: 4
  }
}`,...(v=(I=u.parameters)==null?void 0:I.docs)==null?void 0:v.source}}};var A,H,L;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '/'
    }, {
      label: 'Courses',
      href: '/courses'
    }, {
      label: 'Computer Science',
      href: '/courses/42'
    }, {
      label: 'Assignments',
      href: '/courses/42/assignments'
    }, {
      label: 'Project 3',
      href: '/courses/42/assignments/7'
    }],
    maxItems: 3
  }
}`,...(L=(H=d.parameters)==null?void 0:H.docs)==null?void 0:L.source}}};var P,R,j;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '/',
      icon: <span>⌂</span>
    }, {
      label: 'Files',
      href: '/files',
      icon: <span>📁</span>
    }, {
      label: 'Documents',
      icon: <span>📄</span>
    }]
  }
}`,...(j=(R=p.parameters)==null?void 0:R.docs)==null?void 0:j.source}}};var q,G,M;b.parameters={...b.parameters,docs:{...(q=b.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }}>
      <Breadcrumb pathname="/dashboard" />
      <Breadcrumb pathname="/courses/42/assignments/15" />
      <Breadcrumb pathname="/admin/users/roles/permissions" />
    </div>
}`,...(M=(G=b.parameters)==null?void 0:G.docs)==null?void 0:M.source}}};const $=["Default","TwoLevels","WithAutoGeneration","Collapsed","WithIcons","DeepPath"];export{d as Collapsed,b as DeepPath,i as Default,m as TwoLevels,u as WithAutoGeneration,p as WithIcons,$ as __namedExportsOrder,W as default};
