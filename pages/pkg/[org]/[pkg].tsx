import { useState, useContext } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";
import { mediaBreakpointDown } from "react-grid";

import { CardContainer, Add } from "../../../components/Card";
import { Container, Row, Col } from "../../../utils/grid";
import getPackages, {
  IResponse,
  IPackage,
  IResponseSingle,
} from "../../../api/getPackages";
import DownloadModal from "../../../components/DownloadModal";
import Tag from "../../../components/Tag";
import styled from "../../../utils/theme";
import Header, { SearchBar } from "../../../components/Header";
import generateClipboard from "../../../utils/clipboard";
import { Downloads } from "../../../utils/state/Downloads";
import Custom404 from "../../404";
import getStats, { IStatsResponse } from "../../../api/getStats";
import StatsChart from "../../../components/StatsChart";
import { padDate } from "../../../utils/helperFunctions";

const TopBar = styled(SearchBar)`
  padding: 91px 0 !important;
  background-image: none;
  margin-bottom: 30px;

  h1 {
    font-size: 60px;
    line-height: 1.2;
    margin: 0;
    ${mediaBreakpointDown("sm")} {
      font-size: 36px;
    }

    span {
      font-size: 32px;
      margin-left: 15px;
      ${mediaBreakpointDown("sm")} {
        font-size: 22px;
      }
    }
  }

  h2 {
    margin: 0;
    font-size: 32px;
    ${mediaBreakpointDown("sm")} {
      font-size: 26px;
      margin: 15px 0 0;
    }
  }
  h3 {
    font-size: 18px;
    margin: 8px 0 0;
    img {
      margin-left: 10px;
    }
  }
`;

const CustomRow = styled(Row)`
  flex-direction: row;
  ${mediaBreakpointDown("md")} {
    flex-direction: column-reverse;
  }
`;

const SectionHeader = styled.h2`
  font-size: 24px;
  line-height: 32px;
  margin: 0 0 15px;
`;

const SectionInfo = styled.p`
  font-size: 20px;
  line-height: 30px;
  color: ${(x) => x.theme.textFade};
  margin: 0 0 30px;
  ${mediaBreakpointDown("sm")} {
    font-size: 16px;
  }

  a:hover {
    text-decoration: underline;
  }

  img {
    margin-right: 10px;
  }
`;

const VersionsCard = styled(CardContainer)`
  padding: 20px;
  height: auto !important;
`;

const AddCard = styled(VersionsCard)`
  h2 {
    margin: 0;
    font-weight: 500;
    font-size: 20px;
  }
  button {
    top: 50% !important;
    transform: translateY(-50%) !important;
  }

  &.active {
    border: 2px solid ${(x) => x.theme.accent};
  }
`;

const ShowMoreVersions = styled.p`
  font-size: 14px;
  text-align: center;
  margin: 20px 0px 0px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Version = styled.p`
  font-weight: 500;
  font-size: 20px;
  margin: 0 0 20px;
  ${mediaBreakpointDown("sm")} {
    font-size: 16px;
  }

  span {
    float: right;
    cursor: pointer;
  }

  &:last-child {
    margin: 0;
  }
`;

const CodeBlock = styled.code`
  display: block;
  position: relative;
  margin-bottom: 30px;
  padding: 16px 62px 16px 20px;
  font-family: "Consolas", monospace;
  font-size: 20px;
  color: ${(x) => x.theme.textFade};
  border-radius: 8px;
  background-color: ${(x) => x.theme.darkGrey};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${mediaBreakpointDown("sm")} {
    font-size: 16px;
  }

  &::before {
    content: "> ";
    user-select: none;
  }

  img {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    padding: 0px;
    cursor: pointer;
    height: 25px;
    width: 22px;
  }

  span {
    font-family: inherit;
    color: #fcff9b;
  }
`;

interface IProps {
  data: IResponseSingle;
  stats: IStatsResponse;
}

export default function Pkg({ data, stats }: IProps) {
  const router = useRouter();
  const { org } = router.query;
  const { packages, addPackage, removePackage } = useContext(Downloads);
  const [showMoreVersions, setShowMoreVersions] = useState(false);

  if (data.Package == null) {
    return <Custom404 />;
  }

  const p = data.Package;
  const s = stats.Stats?.Data;

  const inDownloads = !!packages.find((e) => e.Package.Id === p.Id);
  const versionsAmount = 4;
  const versionsLength = p.Versions.length;

  return (
    <div className="container">
      <Head>
        <title>Download and install {p.Latest.Name} with winget</title>
        <meta
          name="description"
          content={
            p.Latest.Description ||
            `Download and install ${p.Latest.Name} and other packages with winget`
          }
        />
        <meta name="twitter:title" content={`${p.Latest.Name} on winget.run`} />
        <meta
          name="twitter:description"
          content={
            p.Latest.Description ||
            `Download and install ${p.Latest.Name} and other packages with winget`
          }
        />
      </Head>
      <header>
        <Header customBar>
          <TopBar>
            <Container>
              <Row>
                <Col col={12}>
                  <h1>
                    {p.Latest.Name}
                    <span>v{p.Versions[0]}</span>
                  </h1>
                  <Link href="/pkg/[org]" as={`/pkg/${org}`}>
                    <a>
                      <h2>{p.Latest.Publisher}</h2>
                    </a>
                  </Link>
                  {p.Latest.Homepage && (
                    <a href={p.Latest.Homepage} target="_blank">
                      <h3>
                        Visit website
                        <img
                          src={require("../../../components/icons/link.svg")}
                          alt=""
                        />
                      </h3>
                    </a>
                  )}
                </Col>
              </Row>
            </Container>
          </TopBar>
        </Header>
      </header>
      <main>
        <Container>
          <CustomRow>
            <Col col={12} lg={4} xl={3}>
              <AddCard className={inDownloads && "active"}>
                <SectionHeader>
                  {inDownloads ? "Remove from list" : "Add to list"}
                </SectionHeader>
                <Add
                  onClick={() => {
                    inDownloads ? removePackage(p) : addPackage(p);
                  }}
                  selected={inDownloads}
                  aria-label="Add to multi-download"
                />
              </AddCard>
              <StatsChart data={padDate(s)} />
              <VersionsCard>
                <SectionHeader>Versions</SectionHeader>
                {p.Versions.slice(
                  0,
                  showMoreVersions ? versionsLength : versionsAmount
                ).map((e) => (
                  <Version key={e}>
                    {e}
                    <span>
                      <img
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          generateClipboard([{ Package: p, Version: e }]);
                          toast.dark(
                            `Copied ${p.Latest.Name}@${e} to clipboard!`
                          );
                        }}
                        src={require("../../../components/icons/copy.svg")}
                        alt=""
                        aria-label={`Copy command for version ${e}`}
                      />
                    </span>
                  </Version>
                ))}
                {}

                {versionsLength > versionsAmount && !showMoreVersions && (
                  <ShowMoreVersions onClick={() => setShowMoreVersions(true)}>
                    Show {versionsLength - versionsAmount} older versions
                  </ShowMoreVersions>
                )}

                {versionsLength > versionsAmount && showMoreVersions && (
                  <ShowMoreVersions onClick={() => setShowMoreVersions(false)}>
                    Hide {versionsLength - versionsAmount} older versions
                  </ShowMoreVersions>
                )}
              </VersionsCard>
            </Col>
            <Col col={12} lg={8} xl={7}>
              <section>
                <SectionHeader>How to install</SectionHeader>
                <CodeBlock>
                  <span>winget</span> install -e --id {p.Id}
                  <img
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      generateClipboard([
                        { Package: p, Version: p.Versions[0] },
                      ]);
                      toast.dark(`Copied ${p.Latest.Name} to clipboard!`);
                    }}
                    src={require("../../../components/icons/copy.svg")}
                    alt=""
                    aria-label="Copy command"
                  />
                </CodeBlock>
              </section>
              {p.Latest.Description && (
                <section>
                  <SectionHeader>About {p.Latest.Name}</SectionHeader>
                  <SectionInfo>{p.Latest.Description}</SectionInfo>
                </section>
              )}
              {p.Latest.Tags?.length > 0 && (
                <section>
                  <SectionHeader>Tags</SectionHeader>
                  {p.Latest.Tags.map((x) => (
                    <Link
                      key={x}
                      href={`/search?tags=${encodeURIComponent(x)}`}
                    >
                      <Tag>{x}</Tag>
                    </Link>
                  ))}
                </section>
              )}
              {p.Latest.License && (
                <section>
                  <SectionHeader>License</SectionHeader>
                  <SectionInfo>
                    {p.Latest.LicenseUrl ? (
                      <a href={p.Latest.LicenseUrl}>
                        <img
                          src={require("../../../components/icons/link.svg")}
                          alt=""
                        />
                        {p.Latest.License}
                      </a>
                    ) : (
                      p.Latest.License
                    )}
                  </SectionInfo>
                </section>
              )}
            </Col>
          </CustomRow>
        </Container>
        <DownloadModal />
      </main>
    </div>
  );
}

export async function getServerSideProps({ res, params }) {
  try {
    const data = await getPackages(`packages/${params.org}/${params.pkg}`);

    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - 1);
    const afterDate = new Date();
    afterDate.setDate(afterDate.getDate() - 8);

    const stats = await getStats(
      `${params.org}.${params.pkg}`,
      "day",
      beforeDate.toISOString(),
      afterDate.toISOString()
    );

    if (data.statusCode === 404) {
      throw new Error();
    }

    console.log(stats);
    return { props: { data, stats } };
  } catch {
    res.statusCode = 404;
    return { props: { data: { Package: null } } };
  }
}
