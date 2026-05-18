import{j as b,a}from"./jsx-runtime-8a1697f2.js";import{T as r}from"./Alert-02560944.js";import"./index-8b3efc3f.js";import"./_commonjsHelpers-de833af9.js";import"./clsx-0839fdbe.js";const _={title:"Components/Toast",component:r,tags:["autodocs"],argTypes:{variant:{control:"select",options:["info","success","warning","danger"]},duration:{control:"number"}}},n={args:{variant:"info",children:"This is an informational message.",duration:0}},e={args:{variant:"success",children:"Your changes have been saved.",duration:0}},s={args:{variant:"warning",children:"Your session will expire soon.",duration:0}},i={args:{variant:"danger",children:"An error occurred while saving.",duration:0}},o={args:{variant:"info",title:"Heads up",children:"This is a toast with a title.",duration:0}},t={render:()=>b("div",{style:{display:"flex",flexDirection:"column",gap:8,maxWidth:400},children:[a(r,{variant:"info",duration:0,children:"This is an informational message."}),a(r,{variant:"success",duration:0,children:"Your changes have been saved successfully."}),a(r,{variant:"warning",duration:0,children:"Your session will expire in 2 minutes."}),a(r,{variant:"danger",duration:0,children:"An error occurred while saving your changes."})]})};var c,d,u;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    children: 'This is an informational message.',
    duration: 0
  }
}`,...(u=(d=n.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var l,m,g;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    children: 'Your changes have been saved.',
    duration: 0
  }
}`,...(g=(m=e.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var p,h,v;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    children: 'Your session will expire soon.',
    duration: 0
  }
}`,...(v=(h=s.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var f,T,w;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    children: 'An error occurred while saving.',
    duration: 0
  }
}`,...(w=(T=i.parameters)==null?void 0:T.docs)==null?void 0:w.source}}};var x,y,S;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    title: 'Heads up',
    children: 'This is a toast with a title.',
    duration: 0
  }
}`,...(S=(y=o.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var Y,A,W;t.parameters={...t.parameters,docs:{...(Y=t.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 400
  }}>
      <Toast variant="info" duration={0}>This is an informational message.</Toast>
      <Toast variant="success" duration={0}>Your changes have been saved successfully.</Toast>
      <Toast variant="warning" duration={0}>Your session will expire in 2 minutes.</Toast>
      <Toast variant="danger" duration={0}>An error occurred while saving your changes.</Toast>
    </div>
}`,...(W=(A=t.parameters)==null?void 0:A.docs)==null?void 0:W.source}}};const C=["Info","Success","Warning","Danger","WithTitle","AllVariants"];export{t as AllVariants,i as Danger,n as Info,e as Success,s as Warning,o as WithTitle,C as __namedExportsOrder,_ as default};
