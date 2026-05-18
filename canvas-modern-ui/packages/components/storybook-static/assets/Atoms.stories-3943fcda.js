import{j as n,a as e}from"./jsx-runtime-8a1697f2.js";import{A as r,B as a,M as $}from"./Atoms-67ed3676.js";import"./index-8b3efc3f.js";import"./_commonjsHelpers-de833af9.js";import"./clsx-0839fdbe.js";const se={title:"Components/Avatar",component:r,tags:["autodocs"]},t={args:{name:"John Doe",size:"md"}},s={args:{name:"Jane Smith",src:"https://i.pravatar.cc/80?u=jane",size:"lg"}},i={render:()=>n("div",{style:{display:"flex",gap:16,alignItems:"center"},children:[e(r,{name:"XS",size:"xs"}),e(r,{name:"Small",size:"sm"}),e(r,{name:"Medium",size:"md"}),e(r,{name:"Large",size:"lg"}),e(r,{name:"XL",size:"xl"})]})},o={render:()=>n("div",{style:{display:"flex",gap:16,alignItems:"center"},children:[e(r,{name:"Alice",status:"online"}),e(r,{name:"Bob",status:"away"}),e(r,{name:"Charlie",status:"offline"})]})},d={render:()=>e("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:["Alice","Bob","Charlie","Diana","Eve","Frank","Grace","Henry","Ivy","Jack"].map(f=>e(r,{name:f},f))})},l={render:()=>e(a,{children:"Default"})},c={render:()=>n("div",{style:{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"},children:[e(a,{variant:"default",children:"Default"}),e(a,{variant:"primary",children:"Primary"}),e(a,{variant:"success",children:"Success"}),e(a,{variant:"warning",children:"Warning"}),e(a,{variant:"danger",children:"Danger"}),e(a,{variant:"info",children:"Info"})]})},m={render:()=>n("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e(a,{variant:"success",dot:!0,children:"Online"}),e(a,{variant:"warning",dot:!0,children:"Away"}),e(a,{variant:"danger",dot:!0,children:"Offline"})]})},p={render:()=>n("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e(a,{count:3,variant:"danger"}),e(a,{count:25,variant:"primary"}),e(a,{count:100,variant:"warning"})]})},u={args:{isOpen:!0,title:"Modal Title",children:"This is a basic modal with default size.",onClose:()=>{}}},g={args:{isOpen:!0,title:"Confirm Action",children:"Are you sure you want to proceed?",footer:n("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e("button",{type:"button",children:"Cancel"}),e("button",{type:"button",style:{background:"#2563EB",color:"white",border:"none",padding:"8px 16px",borderRadius:8},children:"Confirm"})]}),onClose:()=>{}}},v={render:()=>e("div",{style:{display:"flex",gap:12,flexDirection:"column"},children:e($,{isOpen:!0,title:"Small",size:"sm",onClose:()=>{},children:"Small modal content"})})};var y,h,B;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    name: 'John Doe',
    size: 'md'
  }
}`,...(B=(h=t.parameters)==null?void 0:h.docs)==null?void 0:B.source}}};var x,A,S;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    name: 'Jane Smith',
    src: 'https://i.pravatar.cc/80?u=jane',
    size: 'lg'
  }
}`,...(S=(A=s.parameters)==null?void 0:A.docs)==null?void 0:S.source}}};var C,b,z;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  }}>
      <Avatar name="XS" size="xs" />
      <Avatar name="Small" size="sm" />
      <Avatar name="Medium" size="md" />
      <Avatar name="Large" size="lg" />
      <Avatar name="XL" size="xl" />
    </div>
}`,...(z=(b=i.parameters)==null?void 0:b.docs)==null?void 0:z.source}}};var w,D,I;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  }}>
      <Avatar name="Alice" status="online" />
      <Avatar name="Bob" status="away" />
      <Avatar name="Charlie" status="offline" />
    </div>
}`,...(I=(D=o.parameters)==null?void 0:D.docs)==null?void 0:I.source}}};var M,W,O;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  }}>
      {['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'].map(name => <Avatar key={name} name={name} />)}
    </div>
}`,...(O=(W=d.parameters)==null?void 0:W.docs)==null?void 0:O.source}}};var j,k,J;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <Badge>Default</Badge>
}`,...(J=(k=l.parameters)==null?void 0:k.docs)==null?void 0:J.source}}};var E,F,L;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center'
  }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
}`,...(L=(F=c.parameters)==null?void 0:F.docs)==null?void 0:L.source}}};var T,X,G;m.parameters={...m.parameters,docs:{...(T=m.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  }}>
      <Badge variant="success" dot>Online</Badge>
      <Badge variant="warning" dot>Away</Badge>
      <Badge variant="danger" dot>Offline</Badge>
    </div>
}`,...(G=(X=m.parameters)==null?void 0:X.docs)==null?void 0:G.source}}};var H,P,R;p.parameters={...p.parameters,docs:{...(H=p.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  }}>
      <Badge count={3} variant="danger" />
      <Badge count={25} variant="primary" />
      <Badge count={100} variant="warning" />
    </div>
}`,...(R=(P=p.parameters)==null?void 0:P.docs)==null?void 0:R.source}}};var V,_,q;u.parameters={...u.parameters,docs:{...(V=u.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    title: 'Modal Title',
    children: 'This is a basic modal with default size.',
    onClose: () => {}
  }
}`,...(q=(_=u.parameters)==null?void 0:_.docs)==null?void 0:q.source}}};var K,N,Q;g.parameters={...g.parameters,docs:{...(K=g.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    title: 'Confirm Action',
    children: 'Are you sure you want to proceed?',
    footer: <div style={{
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end'
    }}>
      <button type="button">Cancel</button>
      <button type="button" style={{
        background: '#2563EB',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 8
      }}>Confirm</button>
    </div>,
    onClose: () => {}
  }
}`,...(Q=(N=g.parameters)==null?void 0:N.docs)==null?void 0:Q.source}}};var U,Y,Z;v.parameters={...v.parameters,docs:{...(U=v.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    flexDirection: 'column'
  }}>
      <Modal isOpen={true} title="Small" size="sm" onClose={() => {}}>Small modal content</Modal>
    </div>
}`,...(Z=(Y=v.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};const ie=["AvatarDefault","AvatarWithImage","AvatarSizes","AvatarWithStatus","AvatarColors","BadgeDefault","BadgeVariants","BadgeDot","BadgeCount","ModalDefault","ModalWithFooter","ModalSizes"];export{d as AvatarColors,t as AvatarDefault,i as AvatarSizes,s as AvatarWithImage,o as AvatarWithStatus,p as BadgeCount,l as BadgeDefault,m as BadgeDot,c as BadgeVariants,u as ModalDefault,v as ModalSizes,g as ModalWithFooter,ie as __namedExportsOrder,se as default};
