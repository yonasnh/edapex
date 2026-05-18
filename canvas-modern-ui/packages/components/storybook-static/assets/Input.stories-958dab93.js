import{j as d,a as e}from"./jsx-runtime-8a1697f2.js";import{I as q,T as F,S as G,C as p,R as m,a as u}from"./Atoms-67ed3676.js";import"./index-8b3efc3f.js";import"./_commonjsHelpers-de833af9.js";import"./clsx-0839fdbe.js";const V={title:"Components/Input",component:q,argTypes:{size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"},error:{control:"text"},hint:{control:"text"}},tags:["autodocs"]},a={args:{label:"Email",placeholder:"you@example.com"}},r={args:{label:"Email",placeholder:"you@example.com",error:"Please enter a valid email address",value:"invalid"}},o={args:{label:"Password",type:"password",hint:"Must be at least 8 characters"}},l={args:{label:"Search",placeholder:"Search...",icon:d("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",children:[e("circle",{cx:"7",cy:"7",r:"5",stroke:"currentColor",strokeWidth:"1.5"}),e("path",{d:"M11 11l3 3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}},n={render:()=>e(F,{label:"Description",placeholder:"Enter a description...",rows:4})},s={render:()=>e(G,{label:"Role",options:[{value:"student",label:"Student"},{value:"teacher",label:"Teacher"},{value:"admin",label:"Administrator"}],placeholder:"Select a role..."})},t={render:()=>d("div",{style:{display:"flex",flexDirection:"column",gap:8},children:[e(p,{label:"Option A"}),e(p,{label:"Option B"}),e(p,{label:"Option C (disabled)",disabled:!0})]})},c={render:()=>d("div",{style:{display:"flex",flexDirection:"column",gap:8},children:[e(m,{name:"choice",value:"a",label:"Choice A"}),e(m,{name:"choice",value:"b",label:"Choice B"}),e(m,{name:"choice",value:"c",label:"Choice C"})]})},i={render:()=>d("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e(u,{label:"Enable notifications"}),e(u,{label:"Dark mode"}),e(u,{label:"Disabled option",disabled:!0})]})};var h,b,x;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'you@example.com'
  }
}`,...(x=(b=a.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var v,g,S;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: 'Please enter a valid email address',
    value: 'invalid'
  }
}`,...(S=(g=r.parameters)==null?void 0:g.docs)==null?void 0:S.source}}};var C,f,y;o.parameters={...o.parameters,docs:{...(C=o.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters'
  }
}`,...(y=(f=o.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var E,k,w;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: 'Search',
    placeholder: 'Search...',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  }
}`,...(w=(k=l.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var D,W,R;n.parameters={...n.parameters,docs:{...(D=n.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Textarea label="Description" placeholder="Enter a description..." rows={4} />
}`,...(R=(W=n.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};var T,I,O;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <Select label="Role" options={[{
    value: 'student',
    label: 'Student'
  }, {
    value: 'teacher',
    label: 'Teacher'
  }, {
    value: 'admin',
    label: 'Administrator'
  }]} placeholder="Select a role..." />
}`,...(O=(I=s.parameters)==null?void 0:I.docs)==null?void 0:O.source}}};var A,B,M;t.parameters={...t.parameters,docs:{...(A=t.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }}>
      <Checkbox label="Option A" />
      <Checkbox label="Option B" />
      <Checkbox label="Option C (disabled)" disabled />
    </div>
}`,...(M=(B=t.parameters)==null?void 0:B.docs)==null?void 0:M.source}}};var P,j,H;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }}>
      <Radio name="choice" value="a" label="Choice A" />
      <Radio name="choice" value="b" label="Choice B" />
      <Radio name="choice" value="c" label="Choice C" />
    </div>
}`,...(H=(j=c.parameters)==null?void 0:j.docs)==null?void 0:H.source}}};var L,_,z;i.parameters={...i.parameters,docs:{...(L=i.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }}>
      <Switch label="Enable notifications" />
      <Switch label="Dark mode" />
      <Switch label="Disabled option" disabled />
    </div>
}`,...(z=(_=i.parameters)==null?void 0:_.docs)==null?void 0:z.source}}};const X=["DefaultInput","WithError","WithHint","WithIcon","TextareaExample","SelectExample","CheckboxExample","RadioExample","SwitchExample"];export{t as CheckboxExample,a as DefaultInput,c as RadioExample,s as SelectExample,i as SwitchExample,n as TextareaExample,r as WithError,o as WithHint,l as WithIcon,X as __namedExportsOrder,V as default};
