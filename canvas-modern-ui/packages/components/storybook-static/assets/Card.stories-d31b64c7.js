import{j as a,F as fe,a as e}from"./jsx-runtime-8a1697f2.js";import{r as ge}from"./index-8b3efc3f.js";import{c as A}from"./clsx-0839fdbe.js";import"./_commonjsHelpers-de833af9.js";const t=ge.memo(({children:b,variant:i="default",density:V="default",icon:S,title:_,subtitle:D,headerActions:x,footer:T,onClick:r,href:N,selected:k=!1,disabled:n=!1,className:q})=>{const s=i==="interactive"||!!r||!!N,he=s?"button":void 0,ye=s&&!n?0:void 0,E=a(fe,{children:[(_||D||S||x)&&a("div",{className:"cm-card__header",children:[S&&e("div",{className:"cm-card__icon","aria-hidden":"true",children:S}),a("div",{className:"cm-card__titles",children:[_&&e("div",{className:"cm-card__title",children:_}),D&&e("div",{className:"cm-card__subtitle",children:D})]}),x&&e("div",{className:"cm-card__header-actions",children:x})]}),b&&e("div",{className:A("cm-card__body",i==="stat"&&"cm-card__body--stat"),children:b}),T&&e("div",{className:"cm-card__footer",children:T})]});return N&&!n?e("a",{href:N,className:A("cm-card",`cm-card--${i}`,`cm-card--${V}`,s&&"cm-card--interactive",k&&"cm-card--selected",q),"aria-current":k?"page":void 0,children:E}):e("div",{className:A("cm-card",`cm-card--${i}`,`cm-card--${V}`,s&&"cm-card--interactive",k&&"cm-card--selected",q),onClick:n?void 0:r,role:he,tabIndex:ye,onKeyDown:s&&!n?c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),r==null||r(c))}:void 0,"aria-disabled":n||void 0,children:E})});t.displayName="Card";try{t.displayName="Card",t.__docgenInfo={description:"",displayName:"Card",props:{variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"stat"'},{value:'"interactive"'},{value:'"settings"'},{value:'"summary"'}]}},density:{defaultValue:null,description:"",name:"density",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"compact"'},{value:'"comfortable"'}]}},icon:{defaultValue:null,description:"",name:"icon",required:!1,type:{name:"ReactNode"}},title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}},subtitle:{defaultValue:null,description:"",name:"subtitle",required:!1,type:{name:"string"}},headerActions:{defaultValue:null,description:"",name:"headerActions",required:!1,type:{name:"ReactNode"}},footer:{defaultValue:null,description:"",name:"footer",required:!1,type:{name:"ReactNode"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"((e: MouseEvent<Element, MouseEvent>) => void)"}},href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}},selected:{defaultValue:null,description:"",name:"selected",required:!1,type:{name:"boolean"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const _e={title:"Components/Card",component:t,tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","stat","interactive","settings","summary"]},density:{control:"select",options:["comfortable","default","compact"]}}},o={args:{title:"Card Title",subtitle:"A short description of this card.",children:"This is the card body content. Cards can contain any content."}},d={args:{variant:"stat",icon:e("span",{children:"📊"}),title:"Total Students",children:"1,234"}},l={args:{variant:"interactive",title:"Clickable Card",subtitle:"This card responds to clicks and keyboard interaction.",children:"Press Enter or Space to activate.",onClick:()=>alert("Card clicked!")}},u={args:{variant:"interactive",selected:!0,title:"Selected Card",subtitle:"This card is in selected state.",children:"Uses a highlighted background and border."}},m={args:{variant:"settings",title:"Settings Card",subtitle:"Configure your preferences.",children:"Settings content goes in the body.",footer:e("button",{type:"button",children:"Save Changes"})}},p={args:{variant:"summary",title:"Summary",children:"A summary card with a colored left border accent."}},f={args:{title:"Card with Footer",children:"Main content area.",footer:a(fe,{children:[e("button",{type:"button",children:"Cancel"}),e("button",{type:"button",children:"Save"})]})}},h={args:{icon:e("span",{children:"📁"}),title:"Files",subtitle:"Course Materials",children:"Access your course files and documents."}},y={args:{density:"compact",title:"Compact Card",children:"A more condensed layout for data-heavy views."}},g={args:{density:"comfortable",title:"Comfortable Card",subtitle:"A roomier layout for reading-focused content.",children:"More padding and breathing room."}},C={render:()=>a("div",{style:{display:"flex",flexDirection:"column",gap:12,maxWidth:400},children:[e(t,{density:"comfortable",title:"Comfortable",children:"Spacious padding for reading"}),e(t,{density:"default",title:"Default",children:"Standard density for most uses"}),e(t,{density:"compact",title:"Compact",children:"Tight layout for data tables"})]})},v={render:()=>a("div",{style:{display:"flex",flexDirection:"column",gap:12,maxWidth:400},children:[e(t,{title:"Default Card",children:"Basic content card"}),e(t,{variant:"stat",icon:e("span",{children:"📈"}),title:"Stat Card",children:"42"}),e(t,{variant:"interactive",title:"Interactive Card",onClick:()=>{},children:"Clickable with hover effect"}),e(t,{variant:"settings",title:"Settings Card",footer:e("button",{type:"button",children:"Apply"}),children:"Editable preferences"}),e(t,{variant:"summary",title:"Summary Card",children:"Accented left border"})]})};var w,I,F;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    title: 'Card Title',
    subtitle: 'A short description of this card.',
    children: 'This is the card body content. Cards can contain any content.'
  }
}`,...(F=(I=o.parameters)==null?void 0:I.docs)==null?void 0:F.source}}};var M,W,$;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    variant: 'stat',
    icon: <span>📊</span>,
    title: 'Total Students',
    children: '1,234'
  }
}`,...($=(W=d.parameters)==null?void 0:W.docs)==null?void 0:$.source}}};var j,R,B;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    variant: 'interactive',
    title: 'Clickable Card',
    subtitle: 'This card responds to clicks and keyboard interaction.',
    children: 'Press Enter or Space to activate.',
    onClick: () => alert('Card clicked!')
  }
}`,...(B=(R=l.parameters)==null?void 0:R.docs)==null?void 0:B.source}}};var P,U,K;u.parameters={...u.parameters,docs:{...(P=u.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    variant: 'interactive',
    selected: true,
    title: 'Selected Card',
    subtitle: 'This card is in selected state.',
    children: 'Uses a highlighted background and border.'
  }
}`,...(K=(U=u.parameters)==null?void 0:U.docs)==null?void 0:K.source}}};var O,z,G;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    variant: 'settings',
    title: 'Settings Card',
    subtitle: 'Configure your preferences.',
    children: 'Settings content goes in the body.',
    footer: <button type="button">Save Changes</button>
  }
}`,...(G=(z=m.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var H,J,L;p.parameters={...p.parameters,docs:{...(H=p.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    variant: 'summary',
    title: 'Summary',
    children: 'A summary card with a colored left border accent.'
  }
}`,...(L=(J=p.parameters)==null?void 0:J.docs)==null?void 0:L.source}}};var Q,X,Y;f.parameters={...f.parameters,docs:{...(Q=f.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    title: 'Card with Footer',
    children: 'Main content area.',
    footer: <>
        <button type="button">Cancel</button>
        <button type="button">Save</button>
      </>
  }
}`,...(Y=(X=f.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,te;h.parameters={...h.parameters,docs:{...(Z=h.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    icon: <span>📁</span>,
    title: 'Files',
    subtitle: 'Course Materials',
    children: 'Access your course files and documents.'
  }
}`,...(te=(ee=h.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ae,re,ne;y.parameters={...y.parameters,docs:{...(ae=y.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  args: {
    density: 'compact',
    title: 'Compact Card',
    children: 'A more condensed layout for data-heavy views.'
  }
}`,...(ne=(re=y.parameters)==null?void 0:re.docs)==null?void 0:ne.source}}};var se,ie,ce;g.parameters={...g.parameters,docs:{...(se=g.parameters)==null?void 0:se.docs,source:{originalSource:`{
  args: {
    density: 'comfortable',
    title: 'Comfortable Card',
    subtitle: 'A roomier layout for reading-focused content.',
    children: 'More padding and breathing room.'
  }
}`,...(ce=(ie=g.parameters)==null?void 0:ie.docs)==null?void 0:ce.source}}};var oe,de,le;C.parameters={...C.parameters,docs:{...(oe=C.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 400
  }}>
      <Card density="comfortable" title="Comfortable">Spacious padding for reading</Card>
      <Card density="default" title="Default">Standard density for most uses</Card>
      <Card density="compact" title="Compact">Tight layout for data tables</Card>
    </div>
}`,...(le=(de=C.parameters)==null?void 0:de.docs)==null?void 0:le.source}}};var ue,me,pe;v.parameters={...v.parameters,docs:{...(ue=v.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 400
  }}>
      <Card title="Default Card">Basic content card</Card>
      <Card variant="stat" icon={<span>📈</span>} title="Stat Card">42</Card>
      <Card variant="interactive" title="Interactive Card" onClick={() => {}}>Clickable with hover effect</Card>
      <Card variant="settings" title="Settings Card" footer={<button type="button">Apply</button>}>Editable preferences</Card>
      <Card variant="summary" title="Summary Card">Accented left border</Card>
    </div>
}`,...(pe=(me=v.parameters)==null?void 0:me.docs)==null?void 0:pe.source}}};const De=["Default","Stat","Interactive","Selected","Settings","Summary","WithFooter","WithIcon","Compact","Comfortable","Densities","Variants"];export{g as Comfortable,y as Compact,o as Default,C as Densities,l as Interactive,u as Selected,m as Settings,d as Stat,p as Summary,v as Variants,f as WithFooter,h as WithIcon,De as __namedExportsOrder,_e as default};
