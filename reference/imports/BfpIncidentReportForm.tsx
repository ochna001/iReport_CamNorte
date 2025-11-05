import svgPaths from "./svg-jnfywwl0no";

function ButtonSvg() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Button → SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Button â SVG">
          <path d={svgPaths.p336347e0} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pl-[8px] pr-[16px] py-[8px] relative shrink-0" data-name="Button:margin">
      <ButtonSvg />
    </div>
  );
}

function Heading1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[17.4px] text-black w-full">
        <p className="leading-[normal]">BFP Incident Report Form</p>
      </div>
    </div>
  );
}

function Heading1Margin() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col grow items-start min-h-px min-w-px px-0 py-[12.06px] relative shrink-0" data-name="Heading 1:margin">
      <Heading1 />
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Background+HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center pb-[17px] pt-[16px] px-[16px] relative w-full">
          <ButtonMargin />
          <Heading1Margin />
        </div>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[15.5px] text-black w-full">
        <p className="leading-[normal]">Incident Information</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.1px] text-gray-500 text-nowrap">
        <p className="leading-[normal] whitespace-pre">Incident Type</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[15.4px] text-black text-nowrap">
        <p className="leading-[normal] whitespace-pre">Fire</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-[16px] pt-[14px] px-0 relative shrink-0" data-name="Container">
      <Container />
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[75px] items-center relative shrink-0 w-full" data-name="Container">
      <Container2 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p111ed900} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.3px] text-gray-500 text-nowrap">
        <p className="leading-[normal] whitespace-pre">{`Date & Time`}</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[15.1px] text-black text-nowrap">
        <p className="leading-[normal] whitespace-pre">Monday, January 15, 2024</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.2px] text-gray-500 text-nowrap">
        <p className="leading-[normal] whitespace-pre">2:30 PM</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start px-0 py-[14px] relative shrink-0" data-name="Container">
      <Container4 />
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[8px] h-[94px] items-center relative shrink-0 w-full" data-name="Container">
      <Svg />
      <Container7 />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p2c395540} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.1px] text-gray-500 text-nowrap">
        <p className="leading-[normal] whitespace-pre">Reported by</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[15.4px] text-black text-nowrap">
        <p className="leading-[normal] whitespace-pre">Juan Dela Cruz</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-[16px] pt-[14px] px-0 relative shrink-0" data-name="Container">
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[8px] h-[66px] items-center relative shrink-0 w-full" data-name="Container">
      <Svg1 />
      <Container11 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-gray-500 w-full">
        <p className="leading-[normal]">Description</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-gray-50 relative rounded-[6px] shrink-0 w-full" data-name="Background">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[12px] relative w-full">
          <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12.9px] text-black w-full">
            <p className="leading-[normal]">Suspicious activity reported near the commercial district</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[14px] items-start pb-0 pt-[2px] px-0 relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Background />
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[12px] items-start left-[16px] pb-[30px] pt-[32px] px-[16px] right-[16px] rounded-[8px] top-[21.88px]" data-name="Background">
      <Heading3 />
      <Container3 />
      <Container8 />
      <Container12 />
      <Container14 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[15.5px] text-black w-full">
        <p className="leading-[normal]">Details</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14.9px] text-black w-full">
        <p className="leading-[normal]">Location of Fire</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="box-border content-stretch flex flex-col items-start overflow-clip px-0 py-px relative shrink-0 w-[1170px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12.4px] text-black text-nowrap">
        <p className="leading-[15px] whitespace-pre">Select Type</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="bg-white box-border content-stretch flex h-[34px] items-center justify-center pl-[17px] pr-[29px] py-px relative rounded-[6px] shrink-0 w-[299px]" data-name="Options">
      <div aria-hidden="true" className="absolute border border-gray-300 border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container16 />
    </div>
  );
}

function Container17() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14.9px] text-black w-full">
        <p className="leading-[normal]">Area Ownership</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="box-border content-stretch flex flex-col items-start overflow-clip px-0 py-px relative shrink-0 w-[1170px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12.4px] text-black text-nowrap">
        <p className="leading-[15px] whitespace-pre">Select Type</p>
      </div>
    </div>
  );
}

function Options1() {
  return (
    <div className="bg-white box-border content-stretch flex h-[35px] items-center justify-center pl-[17px] pr-[29px] py-px relative rounded-[6px] shrink-0 w-[299px]" data-name="Options">
      <div aria-hidden="true" className="absolute border border-gray-300 border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container18 />
    </div>
  );
}

function Container19() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14.9px] text-black w-full">
        <p className="leading-[normal]">Class of Fire</p>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[12px] h-[482px] items-start left-[16px] pb-[30px] pt-[32px] px-[16px] right-[16px] rounded-[8px] top-[753.88px]" data-name="Background">
      <Heading4 />
      <Container15 />
      <Options />
      <Container17 />
      <Options1 />
      <Container19 />
      <Options1 />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[14.9px] text-black w-[min-content]">
        <p className="leading-[normal]">Root Cause of Fire</p>
      </div>
      <Options1 />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[14.9px] text-black w-[min-content]">
        <p className="leading-[normal]">People Injured</p>
      </div>
      <Options1 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p278d8180} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Label() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0" data-name="Label">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14.9px] text-black text-nowrap">
        <p className="leading-[normal] whitespace-pre">Location</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Svg2 />
      <Label />
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[24px]" data-name="Frame">
      <div className="absolute inset-[12.5%_16.67%_10.47%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-5.41%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 21">
            <path d={svgPaths.p2b7e2f00} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-name="SVG">
      <Frame />
    </div>
  );
}

function SvgMargin() {
  return (
    <div className="box-border content-stretch flex flex-col h-[28px] items-start pb-[4px] pt-0 px-0 relative shrink-0 w-[24px]" data-name="SVG:margin">
      <Svg3 />
    </div>
  );
}

function Margin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start px-0 py-[14px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.2px] text-gray-500 text-nowrap">
        <p className="leading-[normal] whitespace-pre">Map View</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-gray-200 content-stretch flex flex-col h-[128px] items-center justify-center relative rounded-[6px] shrink-0 w-full" data-name="Background">
      <SvgMargin />
      <Margin />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13.2px] text-gray-500 w-full">
        <p className="leading-[normal]">Address</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14.9px] text-black w-full">
        <p className="leading-[normal]">Downtown Area</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[11.4px] text-gray-400 w-full">
        <p className="leading-[normal]">14.5995° N, 120.9842° E</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-0 pt-[2px] px-0 relative shrink-0 w-full" data-name="Container">
      <Container24 />
      <Container25 />
      <Container26 />
    </div>
  );
}

function Background4() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[12px] items-start left-[16px] pb-[28px] pt-[16px] px-[16px] right-[16px] rounded-[8px] top-[437.88px]" data-name="Background">
      <Container23 />
      <Background3 />
      <Container27 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-blue-600 box-border content-stretch flex h-[48px] items-center justify-center left-[32px] pb-[16px] pt-[15px] px-[6px] rounded-[6px] top-[1275.88px] w-[309px]" data-name="Button">
      <div className="basis-0 flex flex-col font-['Inter:Medium',_sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14.8px] text-center text-white">
        <p className="leading-[normal]">Submit</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[1346px] overflow-auto relative shrink-0 w-full" data-name="Container">
      <Background1 />
      <Background2 />
      <Background4 />
      <Button />
    </div>
  );
}

export default function BfpIncidentReportForm() {
  return (
    <div className="bg-gray-100 content-stretch flex flex-col items-start relative size-full" data-name="BFP Incident Report Form">
      <BackgroundHorizontalBorder />
      <Container28 />
    </div>
  );
}