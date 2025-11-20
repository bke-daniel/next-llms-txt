import Image from "next/image";
import "./footer.module.css";

export default function Footer() {
  return (
    <footer className={"next-llms-txt-footer"}>
      <ul className="mx-auto flex">
        <li>
          <a
            href="https://llmstxt.org">
            <Image
              src="https://img.shields.io/badge/llms.txt-compatible-green"
              alt="llms.txt compatible"
              width={122}
              height={20}
            />
          </a>
        </li>
        <li>
          <a
            href="https://www.npmjs.com/package/next-llms-txt">
            <Image
              src="https://img.shields.io/npm/v/next-llms-txt"
              alt="npm version"
              width={80}
              height={20}
            />
          </a>
        </li>
        <li>
          <a
            href="https://www.npmjs.com/package/next-llms-txt">
            <Image
              src="https://img.shields.io/npm/dm/next-llms-txt"
              alt="npm downloads"
              width={144}
              height={20}
            />
          </a>
        </li>
        <li>
          <a
            href="https://github.com/bke-daniel/next-llms-txt/actions/workflows/test.yml">
            <Image src="https://github.com/bke-daniel/next-llms-txt/actions/workflows/test.yml/badge.svg"
              alt="tests"
              width={101}
              height={20}
            />
          </a>
        </li>
        <li>
          <a
            href="https://codecov.io/gh/bke-daniel/next-llms-txt">
            <Image src="https://codecov.io/gh/bke-daniel/next-llms-txt/branch/main/graph/badge.svg"
              alt="codecov"
              width={137}
              height={20}
            />
          </a>
        </li>
        <li>
          <a
            href="https://github.com/bke-daniel/next-llms-txt/blob/main/LICENSE">
            <Image src="https://img.shields.io/npm/l/next-llms-txt"
              alt="license"
              width={78}
              height={20}
            />
          </a>
        </li>
      </ul>
    </footer>
  )
}
