import{j as W,a as r}from"./jsx-runtime-8a1697f2.js";import{A as e}from"./Alert-02560944.js";import"./index-8b3efc3f.js";import"./_commonjsHelpers-de833af9.js";import"./clsx-0839fdbe.js";const C={title:"Components/Alert",component:e,argTypes:{variant:{control:"select",options:["info","success","warning","danger"]},dismissible:{control:"boolean"}},tags:["autodocs"]},n={args:{variant:"info",children:"This is an informational alert.",title:"Information"}},s={args:{variant:"success",children:"Your changes have been saved successfully.",title:"Success"}},a={args:{variant:"warning",children:"Please review your submission before continuing.",title:"Warning"}},i={args:{variant:"danger",children:"There was an error processing your request.",title:"Error"}},t={render:()=>W("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[r(e,{variant:"info",title:"Info",children:"Informational message here."}),r(e,{variant:"success",title:"Success",children:"Operation completed."}),r(e,{variant:"warning",title:"Warning",children:"Check your input."}),r(e,{variant:"danger",title:"Error",children:"Something went wrong."})]})},o={args:{variant:"info",title:"Dismissible Alert",children:"You can dismiss this alert by clicking the close button.",dismissible:!0}};var c,l,m;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    children: 'This is an informational alert.',
    title: 'Information'
  }
}`,...(m=(l=n.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var u,d,g;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    children: 'Your changes have been saved successfully.',
    title: 'Success'
  }
}`,...(g=(d=s.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};var p,h,f;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    children: 'Please review your submission before continuing.',
    title: 'Warning'
  }
}`,...(f=(h=a.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var v,b,y;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    children: 'There was an error processing your request.',
    title: 'Error'
  }
}`,...(y=(b=i.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var A,S,w;t.parameters={...t.parameters,docs:{...(A=t.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }}>
      <Alert variant="info" title="Info">Informational message here.</Alert>
      <Alert variant="success" title="Success">Operation completed.</Alert>
      <Alert variant="warning" title="Warning">Check your input.</Alert>
      <Alert variant="danger" title="Error">Something went wrong.</Alert>
    </div>
}`,...(w=(S=t.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var x,D,I;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    title: 'Dismissible Alert',
    children: 'You can dismiss this alert by clicking the close button.',
    dismissible: true
  }
}`,...(I=(D=o.parameters)==null?void 0:D.docs)==null?void 0:I.source}}};const O=["Info","Success","Warning","Danger","AllVariants","Dismissible"];export{t as AllVariants,i as Danger,o as Dismissible,n as Info,s as Success,a as Warning,O as __namedExportsOrder,C as default};
