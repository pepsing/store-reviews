(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{392:function(e,t,a){},637:function(e,t,a){},638:function(e,t,a){"use strict";a.r(t);var s=a(0),c=a.n(s),r=a(39),n=a.n(r),i=(a(392),a(654)),l=a(648),j=a(647),d=a(381),o=a(642),b=a(643),h=a(90),p=a(650),O=a(655),x=a(644),u=a(377),m=a(651),g=a(652),y=a(653),f=a(158),v=a(383),S=a(384),w=a(656),_=a(657),C=a(658),k=a(645),I=a(649),A=a(646),T=a(373),F=a(374),P=a(110),$=a(135),D=a(372),z=a(109),E=a.n(z),K=a(9);const{Paragraph:L}=l.a,q=10,V={cn:"\u4e2d\u56fd",us:"\u7f8e\u56fd",jp:"\u65e5\u672c",kr:"\u97e9\u56fd",hk:"\u9999\u6e2f",tw:"\u53f0\u6e7e",sg:"\u65b0\u52a0\u5761",my:"\u9a6c\u6765\u897f\u4e9a",id:"\u5370\u5ea6\u5c3c\u897f\u4e9a",ph:"\u83f2\u5f8b\u5bbe",mm:"\u7f05\u7538",th:"\u6cf0\u56fd",vn:"\u8d8a\u5357"},B=()=>{const[e,t]=Object(s.useState)([]),[a,c]=Object(s.useState)(null),[r,n]=Object(s.useState)([]),[i,l]=Object(s.useState)(!1),[z,B]=Object(s.useState)(!1),[J]=j.a.useForm(),[G,H]=Object(s.useState)(!1),[M,N]=Object(s.useState)(null),[X,Q]=Object(s.useState)({ios:1,android:1}),[R,U]=Object(s.useState)(!1),[W,Y]=Object(s.useState)(localStorage.getItem("authCode")||""),[Z,ee]=Object(s.useState)((()=>Promise.resolve()));Object(s.useEffect)((()=>{te()}),[]);const te=async()=>{try{const e=await E.a.get("/api/apps");t(e.data)}catch(e){d.b.error("\u83b7\u53d6\u5e94\u7528\u5217\u8868\u5931\u8d25")}},ae=async e=>{l(!0);try{const t=await E.a.get(`/api/apps/${e}/reviews`);n(t.data)}catch(t){d.b.error("\u83b7\u53d6\u8bc4\u8bba\u5931\u8d25")}finally{l(!1)}},se=async e=>{if(!W)return ee((()=>e)),void U(!0);try{await e()}catch(a){var t;if(401!==(null===(t=a.response)||void 0===t?void 0:t.status))throw a;d.b.error("\u6388\u6743\u7801\u65e0\u6548"),Y(""),localStorage.removeItem("authCode"),ee((()=>e)),U(!0)}};E.a.interceptors.request.use((e=>{const t={...e};return t.headers=t.headers||{},W&&(t.headers["X-Auth-Code"]=W),t}));const ce=()=>{const e={};r.forEach((t=>{const a=t.created_at.split("T")[0];e[a]||(e[a]={ios:[],android:[]}),e[a][t.platform].push(t.rating)}));const t=[];return Object.entries(e).forEach((e=>{let[a,s]=e;s.ios.length>0&&t.push({date:a,platform:"iOS",average_rating:s.ios.reduce(((e,t)=>e+t),0)/s.ios.length}),s.android.length>0&&t.push({date:a,platform:"Android",average_rating:s.android.reduce(((e,t)=>e+t),0)/s.android.length})})),t.sort(((e,t)=>e.date.localeCompare(t.date)))},re=r.filter((e=>"ios"===e.platform)),ne=r.filter((e=>"android"===e.platform)),ie=e=>{if(0===e.length)return 0;const t=e.reduce(((e,t)=>e+t.rating),0);return Number((t/e.length).toFixed(1))},le=ie(re),je=ie(ne);return Object(K.jsxs)("div",{style:{padding:"24px"},children:[Object(K.jsxs)(o.a,{gutter:[16,16],justify:"space-between",align:"middle",children:[Object(K.jsx)(b.a,{children:Object(K.jsx)("h2",{children:"\u5e94\u7528\u5217\u8868"})}),Object(K.jsx)(b.a,{children:Object(K.jsx)(h.a,{type:"primary",icon:Object(K.jsx)(v.a,{}),onClick:()=>B(!0),children:"\u6dfb\u52a0\u5e94\u7528"})})]}),Object(K.jsx)(o.a,{gutter:[16,16],style:{marginTop:"16px"},children:e.map((e=>Object(K.jsx)(b.a,{xs:24,sm:12,md:8,lg:6,children:Object(K.jsxs)(p.a,{title:e.name,extra:Object(K.jsxs)("div",{onClick:e=>e.stopPropagation(),children:[Object(K.jsx)(h.a,{type:"text",icon:Object(K.jsx)(S.a,{}),onClick:()=>{N(e),J.setFieldsValue(e)}}),Object(K.jsx)(O.a,{title:"\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e2a\u5e94\u7528\u5417\uff1f",onConfirm:()=>(async e=>{await se((async()=>{await E.a.delete(`/api/apps/${e}`),d.b.success("\u5220\u9664\u5e94\u7528\u6210\u529f"),(null===a||void 0===a?void 0:a.id)===e&&c(null),te()}))})(e.id),okText:"\u786e\u5b9a",cancelText:"\u53d6\u6d88",children:Object(K.jsx)(h.a,{type:"text",danger:!0,icon:Object(K.jsx)(w.a,{})})})]}),hoverable:!0,onClick:()=>{c(e),ae(e.id)},children:[Object(K.jsxs)("p",{children:["\u5e73\u53f0: ",e.platform]}),e.app_store_id&&Object(K.jsxs)("p",{children:["App Store ID: ",e.app_store_id]}),e.play_store_id&&Object(K.jsxs)("p",{children:["Play Store ID: ",e.play_store_id]})]})},e.id)))}),a&&Object(K.jsxs)(p.a,{style:{marginTop:"24px"},children:[Object(K.jsxs)(o.a,{justify:"space-between",align:"middle",children:[Object(K.jsx)(b.a,{children:Object(K.jsxs)("h3",{children:[a.name," \u8bc4\u5206\u8d8b\u52bf"]})}),Object(K.jsx)(b.a,{children:Object(K.jsxs)(h.a.Group,{children:[Object(K.jsx)(h.a,{type:"primary",icon:Object(K.jsx)(_.a,{spin:G}),onClick:()=>(async e=>{H(!0);try{await E.a.post(`/api/apps/${e}/refresh`),d.b.success("\u8bc4\u5206\u66f4\u65b0\u6210\u529f"),await ae(e)}catch(t){d.b.error("\u8bc4\u5206\u66f4\u65b0\u5931\u8d25")}finally{H(!1)}})(a.id),loading:G,children:"\u66f4\u65b0\u8bc4\u5206"}),Object(K.jsx)(h.a,{type:"primary",icon:Object(K.jsx)(C.a,{}),onClick:()=>(async e=>{try{d.b.loading("\u6b63\u5728\u51c6\u5907\u5bfc\u51fa\u6587\u4ef6...",1),window.open(`/api/apps/${e}/export`,"_blank"),d.b.success("\u8bc4\u8bba\u5bfc\u51fa\u6210\u529f")}catch(t){d.b.error("\u8bc4\u8bba\u5bfc\u51fa\u5931\u8d25")}})(a.id),children:"\u5bfc\u51fa\u8bc4\u8bba"})]})})]}),i?Object(K.jsx)("div",{style:{textAlign:"center",padding:"40px"},children:Object(K.jsx)(x.a,{})}):Object(K.jsxs)(K.Fragment,{children:[Object(K.jsx)(k.a,{width:"100%",height:400,children:Object(K.jsxs)(I.a,{data:ce(),children:[Object(K.jsx)(A.a,{strokeDasharray:"3 3"}),Object(K.jsx)(T.a,{dataKey:"date"}),Object(K.jsx)(F.a,{domain:[0,5]}),Object(K.jsx)(P.a,{formatter:e=>e.toFixed(2)}),Object(K.jsx)($.a,{}),Object(K.jsx)(D.a,{type:"monotone",dataKey:"average_rating",name:"iOS",stroke:"#8884d8",data:ce().filter((e=>"iOS"===e.platform))}),Object(K.jsx)(D.a,{type:"monotone",dataKey:"average_rating",name:"Android",stroke:"#82ca9d",data:ce().filter((e=>"Android"===e.platform))})]})}),Object(K.jsxs)("div",{style:{marginTop:"24px"},children:[Object(K.jsx)("h3",{children:"\u6700\u65b0\u8bc4\u8bba"}),Object(K.jsxs)(u.a,{defaultActiveKey:"ios",children:[Object(K.jsxs)(u.a.TabPane,{tab:`iOS \u8bc4\u8bba (${le}\u2b50)`,children:[Object(K.jsxs)(o.a,{gutter:[16,16],children:[re.slice((X.ios-1)*q,X.ios*q).map((e=>Object(K.jsx)(b.a,{span:24,children:Object(K.jsxs)(p.a,{size:"small",children:[Object(K.jsxs)("p",{children:["\u8bc4\u5206: ","\u2b50".repeat(e.rating)]}),Object(K.jsxs)("p",{children:["\u5185\u5bb9:",Object(K.jsx)(L,{ellipsis:{rows:2,expandable:!0,symbol:"\u5c55\u5f00"},children:e.content})]}),Object(K.jsxs)("p",{children:["\u4f5c\u8005: ",e.author]}),Object(K.jsxs)("p",{children:["\u65f6\u95f4: ",new Date(e.created_at).toLocaleString()]})]})},e.id))),0===re.length&&Object(K.jsx)(b.a,{span:24,children:Object(K.jsx)(p.a,{size:"small",children:Object(K.jsx)("p",{children:"\u6682\u65e0 iOS \u8bc4\u8bba"})})})]}),re.length>0&&Object(K.jsx)("div",{style:{textAlign:"right",marginTop:"16px"},children:Object(K.jsx)(m.a,{current:X.ios,onChange:e=>Q((t=>({...t,ios:e}))),total:re.length,pageSize:q,showTotal:e=>`\u5171 ${e} \u6761\u8bc4\u8bba`})})]},"ios"),Object(K.jsxs)(u.a.TabPane,{tab:`Android \u8bc4\u8bba (${je}\u2b50)`,children:[Object(K.jsxs)(o.a,{gutter:[16,16],children:[ne.slice((X.android-1)*q,X.android*q).map((e=>Object(K.jsx)(b.a,{span:24,children:Object(K.jsxs)(p.a,{size:"small",children:[Object(K.jsxs)("p",{children:["\u8bc4\u5206: ","\u2b50".repeat(e.rating)]}),Object(K.jsxs)("p",{children:["\u5185\u5bb9:",Object(K.jsx)(L,{ellipsis:{rows:2,expandable:!0,symbol:"\u5c55\u5f00"},children:e.content})]}),Object(K.jsxs)("p",{children:["\u4f5c\u8005: ",e.author]}),Object(K.jsxs)("p",{children:["\u65f6\u95f4: ",new Date(e.created_at).toLocaleString()]})]})},e.id))),0===ne.length&&Object(K.jsx)(b.a,{span:24,children:Object(K.jsx)(p.a,{size:"small",children:Object(K.jsx)("p",{children:"\u6682\u65e0 Android \u8bc4\u8bba"})})})]}),ne.length>0&&Object(K.jsx)("div",{style:{textAlign:"right",marginTop:"16px"},children:Object(K.jsx)(m.a,{current:X.android,onChange:e=>Q((t=>({...t,android:e}))),total:ne.length,pageSize:q,showTotal:e=>`\u5171 ${e} \u6761\u8bc4\u8bba`})})]},"android")]})]})]})]}),Object(K.jsx)(g.a,{title:M?"\u4fee\u6539\u5e94\u7528":"\u6dfb\u52a0\u5e94\u7528",visible:z||!!M,onCancel:()=>{B(!1),N(null),J.resetFields()},footer:null,children:Object(K.jsxs)(j.a,{form:J,onFinish:M?async e=>{await se((async()=>{await E.a.put(`/api/apps/${null===M||void 0===M?void 0:M.id}`,e),d.b.success("\u4fee\u6539\u5e94\u7528\u6210\u529f"),N(null),J.resetFields(),te()}))}:async e=>{await se((async()=>{await E.a.post("/api/apps",e),d.b.success("\u6dfb\u52a0\u5e94\u7528\u6210\u529f"),B(!1),J.resetFields(),te()}))},layout:"vertical",children:[Object(K.jsx)(j.a.Item,{name:"name",label:"\u5e94\u7528\u540d\u79f0",rules:[{required:!0}],children:Object(K.jsx)(y.a,{})}),Object(K.jsx)(j.a.Item,{name:"platform",label:"\u5e73\u53f0",rules:[{required:!0}],children:Object(K.jsxs)(f.a,{children:[Object(K.jsx)(f.a.Option,{value:"ios",children:"iOS"}),Object(K.jsx)(f.a.Option,{value:"android",children:"Android"}),Object(K.jsx)(f.a.Option,{value:"both",children:"\u53cc\u5e73\u53f0"})]})}),Object(K.jsx)(j.a.Item,{name:"app_store_country",label:"App Store \u5730\u533a",initialValue:"cn",children:Object(K.jsx)(f.a,{children:Object.entries(V).map((e=>{let[t,a]=e;return Object(K.jsx)(f.a.Option,{value:t,children:a},t)}))})}),Object(K.jsx)(j.a.Item,{name:"play_store_country",label:"Play Store \u5730\u533a",initialValue:"cn",children:Object(K.jsx)(f.a,{children:Object.entries(V).map((e=>{let[t,a]=e;return Object(K.jsx)(f.a.Option,{value:t,children:a},t)}))})}),Object(K.jsx)(j.a.Item,{name:"app_store_id",label:"App Store ID",rules:[{pattern:/^\d+$/,message:"App Store ID \u5fc5\u987b\u662f\u6570\u5b57"}],children:Object(K.jsx)(y.a,{placeholder:"\u4f8b\u5982\uff1a414478124"})}),Object(K.jsx)(j.a.Item,{name:"play_store_id",label:"Play Store ID",children:Object(K.jsx)(y.a,{})}),Object(K.jsx)(j.a.Item,{children:Object(K.jsx)(h.a,{type:"primary",htmlType:"submit",children:"\u63d0\u4ea4"})})]})}),Object(K.jsx)(g.a,{title:"\u8bf7\u8f93\u5165\u6388\u6743\u7801",visible:R,onOk:async()=>{try{localStorage.setItem("authCode",W),await Z(),U(!1)}catch(e){d.b.error("\u64cd\u4f5c\u5931\u8d25")}},onCancel:()=>{U(!1),ee((()=>Promise.resolve()))},children:Object(K.jsx)(y.a.Password,{value:W,onChange:e=>Y(e.target.value),placeholder:"\u8bf7\u8f93\u5165\u6388\u6743\u7801"})})]})};a(637);const{Header:J,Content:G}=i.a;var H=()=>Object(K.jsxs)(i.a,{children:[Object(K.jsx)(J,{style:{background:"#fff",padding:"0 24px"},children:Object(K.jsx)("h1",{children:"\u5e94\u7528\u8bc4\u5206\u8ffd\u8e2a\u7cfb\u7edf"})}),Object(K.jsx)(G,{children:Object(K.jsx)(B,{})})]});var M=e=>{e&&e instanceof Function&&a.e(3).then(a.bind(null,659)).then((t=>{let{getCLS:a,getFID:s,getFCP:c,getLCP:r,getTTFB:n}=t;a(e),s(e),c(e),r(e),n(e)}))};n.a.render(Object(K.jsx)(c.a.StrictMode,{children:Object(K.jsx)(H,{})}),document.getElementById("root")),M()}},[[638,1,2]]]);
//# sourceMappingURL=main.73825fd8.chunk.js.map