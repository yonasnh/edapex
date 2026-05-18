import{j as p,a as e}from"./jsx-runtime-8a1697f2.js";import{B as r,a as Q}from"./Button-433554b2.js";import"./index-8b3efc3f.js";import"./_commonjsHelpers-de833af9.js";import"./clsx-0839fdbe.js";const $={title:"Components/Button",component:r,argTypes:{variant:{control:"select",options:["primary","secondary","ghost","destructive"]},size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"},loading:{control:"boolean"}},tags:["autodocs"]},a={args:{variant:"primary",children:"Primary Button"}},n={args:{variant:"secondary",children:"Secondary Button"}},s={args:{variant:"ghost",children:"Ghost Button"}},t={args:{variant:"destructive",children:"Delete"}},o={args:{size:"sm",children:"Small"}},c={args:{size:"lg",children:"Large"}},i={args:{loading:!0,children:"Saving..."}},d={args:{disabled:!0,children:"Disabled"}},l={render:()=>p("div",{style:{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"},children:[e(r,{variant:"primary",children:"Primary"}),e(r,{variant:"secondary",children:"Secondary"}),e(r,{variant:"ghost",children:"Ghost"}),e(r,{variant:"destructive",children:"Destructive"})]})},m={render:()=>p("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e(r,{size:"sm",children:"Small"}),e(r,{size:"md",children:"Medium"}),e(r,{size:"lg",children:"Large"})]})},u={render:()=>p(Q,{children:[e(r,{variant:"secondary",children:"Cancel"}),e(r,{children:"Save"})]})};var g,h,v;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
}`,...(v=(h=a.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var y,B,S;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
}`,...(S=(B=n.parameters)==null?void 0:B.docs)==null?void 0:S.source}}};var z,x,G;s.parameters={...s.parameters,docs:{...(z=s.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    children: 'Ghost Button'
  }
}`,...(G=(x=s.parameters)==null?void 0:x.docs)==null?void 0:G.source}}};var D,b,f;t.parameters={...t.parameters,docs:{...(D=t.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    variant: 'destructive',
    children: 'Delete'
  }
}`,...(f=(b=t.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var L,P,A;o.parameters={...o.parameters,docs:{...(L=o.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Small'
  }
}`,...(A=(P=o.parameters)==null?void 0:P.docs)==null?void 0:A.source}}};var I,j,C;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: 'Large'
  }
}`,...(C=(j=c.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};var E,w,M;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: 'Saving...'
  }
}`,...(M=(w=i.parameters)==null?void 0:w.docs)==null?void 0:M.source}}};var V,W,_;d.parameters={...d.parameters,docs:{...(V=d.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: 'Disabled'
  }
}`,...(_=(W=d.parameters)==null?void 0:W.docs)==null?void 0:_.source}}};var O,T,k;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center'
  }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
}`,...(k=(T=l.parameters)==null?void 0:T.docs)==null?void 0:k.source}}};var q,F,H;m.parameters={...m.parameters,docs:{...(q=m.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
}`,...(H=(F=m.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};var J,K,N;u.parameters={...u.parameters,docs:{...(J=u.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => <ButtonGroup>
      <Button variant="secondary">Cancel</Button>
      <Button>Save</Button>
    </ButtonGroup>
}`,...(N=(K=u.parameters)==null?void 0:K.docs)==null?void 0:N.source}}};const rr=["Primary","Secondary","Ghost","Destructive","Small","Large","Loading","Disabled","AllVariants","AllSizes","ButtonGroupExample"];export{m as AllSizes,l as AllVariants,u as ButtonGroupExample,t as Destructive,d as Disabled,s as Ghost,c as Large,i as Loading,a as Primary,n as Secondary,o as Small,rr as __namedExportsOrder,$ as default};
