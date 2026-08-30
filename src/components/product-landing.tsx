"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Radio, ShieldCheck } from "lucide-react";
import { contractAddress, contractExplorerUrl } from "@/lib/deployment";

const zones = [
  { name: "NORTH", x: "19%", y: "20%", tone: "orange" },
  { name: "EAST", x: "72%", y: "31%", tone: "green" },
  { name: "CENTRAL", x: "47%", y: "56%", tone: "orange" },
  { name: "SOUTH", x: "31%", y: "77%", tone: "green" },
];

export function ProductLanding() {
  return (
    <main className="shelter-entry" data-landing="emergency-network-map">
      <header><Link href="./" className="brand"><ShieldCheck size={23}/> SHELTERGRID</Link><div className="live"><i/> READINESS NETWORK LIVE</div><Link href="./network/">COMMAND NETWORK</Link></header>
      <section className="command">
        <div className="map" aria-label="Shelter readiness network">
          <div className="roads" aria-hidden="true"><i/><i/><i/><i/><i/></div>
          {zones.map(zone=><div key={zone.name} className={`node ${zone.tone}`} style={{left:zone.x,top:zone.y}}><b/><span>{zone.name}</span></div>)}
          <div className="map-key"><span><i className="green"/> READY</span><span><i className="orange"/> REVIEW</span></div>
        </div>
        <div className="brief">
          <p><Radio size={15}/> CIVIL READINESS / NETWORK 10</p>
          <h1>Every shelter.<br/>One shared picture.</h1>
          <p className="lead">Register facilities, verify capacity evidence and coordinate readiness decisions on a public GenLayer record.</p>
          <Link href="./network/">Open command network <ArrowRight size={18}/></Link>
          <div className="contract"><span>ACTIVE DEPLOYMENT</span><code>{contractAddress || "PENDING"}</code><a href={contractExplorerUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/></a></div>
        </div>
      </section>
      <footer><strong>10</strong><span>STATION REGISTRY</span><span>CAPACITY EVIDENCE</span><span>READINESS REVIEW</span><Link href="./network/">VIEW ALL STATIONS</Link></footer>
      <style jsx global>{`
        .shelter-entry{min-height:100vh;background:#eef2e8;color:#14221a;font-family:"Barlow Condensed",sans-serif;border-bottom:10px solid #f04a2f}
        header{height:70px;background:#14221a;color:#fff;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(18px,4vw,54px);font-size:12px}header a{color:inherit;text-decoration:none}.brand{font-size:20px;font-weight:700;display:flex;align-items:center;gap:10px}.live{display:flex;gap:8px;align-items:center}.live i{width:8px;height:8px;background:#8fd14f;border-radius:50%}header>a:last-child{text-align:right}
        .command{display:grid;grid-template-columns:1.2fr .8fr;min-height:650px}.map{position:relative;overflow:hidden;border-right:2px solid #14221a;background-color:#dce4d3;background-image:linear-gradient(33deg,transparent 48%,#b4c4aa 49%,#b4c4aa 51%,transparent 52%),linear-gradient(121deg,transparent 48%,#b4c4aa 49%,#b4c4aa 51%,transparent 52%);background-size:190px 150px}
        .roads i{position:absolute;height:9px;background:#f7f4e9;border:1px solid #a6b39f;width:110%;left:-5%;top:18%;transform:rotate(11deg)}.roads i:nth-child(2){top:46%;transform:rotate(-16deg)}.roads i:nth-child(3){top:74%;transform:rotate(7deg)}.roads i:nth-child(4){width:9px;height:110%;left:28%;top:-5%;transform:rotate(8deg)}.roads i:nth-child(5){width:9px;height:110%;left:67%;top:-5%;transform:rotate(-13deg)}
        .node{position:absolute;z-index:2;display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700}.node b{width:28px;height:28px;background:#14221a;border:7px solid #8fd14f;border-radius:50%;box-shadow:0 0 0 4px #14221a}.node.orange b{border-color:#f04a2f}.node span{background:#fff;border:1px solid #14221a;padding:5px 8px}.map-key{position:absolute;left:25px;bottom:24px;background:#fff;border:1px solid #14221a;padding:12px 14px;display:flex;gap:18px;font-size:10px}.map-key span{display:flex;align-items:center;gap:7px}.map-key i{width:8px;height:8px}.map-key .green{background:#8fd14f}.map-key .orange{background:#f04a2f}
        .brief{padding:clamp(55px,7vw,100px) clamp(25px,5vw,72px);background:#f7f4e9}.brief>p:first-child{display:flex;align-items:center;gap:8px;color:#e13c25;font-size:12px;font-weight:700}h1{font-size:clamp(60px,7vw,96px);line-height:.86;margin:24px 0 30px;text-transform:uppercase}.lead{font-family:Arial,sans-serif;font-size:16px;line-height:1.6;max-width:530px}.brief>a{display:inline-flex;align-items:center;gap:12px;background:#f04a2f;color:#fff;text-decoration:none;padding:15px 18px;margin-top:24px;font-weight:700;font-size:15px}.contract{border-top:2px solid #14221a;margin-top:50px;padding-top:16px;display:grid;grid-template-columns:1fr auto;gap:8px}.contract span{font-size:10px}.contract code{grid-row:2;font:10px ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis}.contract a{grid-column:2;grid-row:1/3;color:inherit;align-self:center}
        footer{height:82px;display:grid;grid-template-columns:auto repeat(3,1fr) auto;align-items:center;border-top:2px solid #14221a}footer>*{padding:0 24px;border-right:1px solid #14221a;height:100%;display:flex;align-items:center}footer strong{font-size:45px;background:#14221a;color:#fff}footer span{font-size:11px}footer a{color:inherit;font-size:12px;font-weight:700;border-right:0}
        @media(max-width:760px){header{grid-template-columns:1fr auto}.live{display:none}.command{grid-template-columns:1fr}.map{height:390px;border-right:0;border-bottom:2px solid #14221a}.brief{padding:50px 22px}h1{font-size:60px}footer{grid-template-columns:auto 1fr auto;height:72px}footer span:nth-of-type(2),footer span:nth-of-type(3){display:none}footer>*{padding:0 14px}}
      `}</style>
    </main>
  );
}
