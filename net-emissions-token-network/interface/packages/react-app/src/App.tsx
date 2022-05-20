// SPDX-License-Identifier: Apache-2.0
import { ElementRef, FC, useRef, useState, lazy, Suspense } from "react";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';

import useWeb3Modal from "./hooks/useWeb3Modal";
import NavigationBar from "./components/navigation-bar";

import { Link, Route, Switch, Redirect, useLocation } from "wouter"

import { QueryClient, QueryClientProvider } from "react-query";
import { trpc, useTrpcClient } from "./services/trpc";


// lazy load routes
const Dashboard = lazy(() => import("./pages/dashboard"));
const SignUp = lazy(() => import("./pages/sign-up"));
const SignIn = lazy(() => import("./pages/sign-in"));
const IssuedTokens = lazy(() => import("./pages/issued-tokens"));
const EmissionsRequests = lazy(() => import("./pages/emissions-requests"));
const PendingEmissions = lazy(() => import("./pages/pending-emissions"));
const IssueForm = lazy(() => import("./pages/issue-form"));
const TrackForm = lazy(() => import("./pages/track-form"));
const TransferForm = lazy(() => import("./pages/transfer-form"));
const RetireForm = lazy(() => import("./pages/retire-form"));
const AccessControlForm = lazy(() => import("./pages/access-control-form"));
const GovernanceDashboard = lazy(() => import("./pages/governance-dashboard"));
const RequestAudit = lazy(() => import("./pages/request-audit"));
const ChangePassword = lazy(() => import("./pages/change-password"));
const ExportPk = lazy(() => import("./pages/export-pk"));

const App:FC = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useTrpcClient();

  const { provider, loadWeb3Modal, logoutOfWeb3Modal, loadWalletInfo, logoutOfWalletInfo, signedInAddress, signedInWallet, roles, registeredTracker, limitedMode, refresh } = useWeb3Modal();

  const [location] = useLocation();

  const dashboardRef = useRef<ElementRef<typeof Dashboard>>(null);
  const accessControlRef = useRef<ElementRef<typeof AccessControlForm>>(null);

  const isOwner = roles.isAdmin;
  const isDealer = roles.hasDealerRole;
  const isOwnerOrDealer = (isOwner || isDealer);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NavigationBar
          provider={provider}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          logoutOfWalletInfo={logoutOfWalletInfo}
          signedInAddress={signedInAddress}
          signedInWallet={signedInWallet}
          roles={roles}
          limitedMode={limitedMode}
          />

        {/* Tabs to pages */}
        <Nav fill variant="tabs" className="mt-2 mb-4 border-bottom-0">
          {/* On dashboard page, click this link to refresh the balances */}
          {/* Else on other page, click this link to go to dashboard */}
          {(location.substring(1) === "dashboard")
            ? <Nav.Link onClick={() => dashboardRef.current?.refresh()} eventKey="dashboard">Dashboard</Nav.Link>
            : <Link href="/dashboard"><Nav.Link eventKey="dashboard">Dashboard</Nav.Link></Link>
        }

          <Link href="/governance"><Nav.Link eventKey="governance">Governance</Nav.Link></Link>
          {isOwnerOrDealer ? 
            <Link href="/issuedtokens"><Nav.Link eventKey="issue">Issue tokens</Nav.Link></Link>
            : null
        }
          <Link href="/requestAudit"><Nav.Link eventKey="requestAudit">Request audit</Nav.Link></Link>

          {((limitedMode && isOwner) || !limitedMode) &&
            <Link href="/transfer"><Nav.Link eventKey="transfer">Transfer tokens</Nav.Link></Link>
        }

          <Link href="/retire"><Nav.Link eventKey="retire">Retire tokens</Nav.Link></Link>

          {((limitedMode && isOwner) || !limitedMode) &&
            <Link href="/track"><Nav.Link eventKey="track">Track</Nav.Link></Link>
        }

          {/* Display "Manage Roles" if owner/dealer, "My Roles" otherwise */}
          {(location.substring(1) === "access-control")
            ? <Nav.Link onClick={() => accessControlRef.current?.refresh()} eventKey="access-control">
              {( (!limitedMode && isOwnerOrDealer) || (limitedMode && isOwner) )
                ? "Manage roles"
                : "My roles"
            }
            </Nav.Link>
            : <Link href="/access-control"><Nav.Link eventKey="access-control">
            {( (!limitedMode && isOwnerOrDealer) || (limitedMode && isOwner) )
              ? "Manage roles"
              : "My roles"
          }
          </Nav.Link></Link> 
        }

        </Nav>

        <Container className="my-2">

          <Tab.Container defaultActiveKey={location.substring(1) || "dashboard"}>
            <Tab.Content>
              <Suspense fallback={<p>Loading ...</p>}>
                <Switch>
                  <Route path="/"><Redirect to="/dashboard" /></Route>
                  <Route path="/dashboard/:address?">{params=>
                    <Dashboard ref={dashboardRef} provider={provider} signedInAddress={params.address||signedInAddress} displayAddress={params.address} />
                  }</Route>
                  <Route path="/governance">
                    <GovernanceDashboard provider={provider} roles={roles} signedInAddress={signedInAddress} />
                  </Route>
                  <Route path="/issue">
                    <IssueForm provider={provider} roles={roles} signedInAddress={signedInAddress} limitedMode={limitedMode} signedInWallet = {signedInWallet}  />
                  </Route>
                  <Route path="/requestAudit">
                    <RequestAudit provider={provider} roles={roles} signedInAddress={signedInAddress} limitedMode={limitedMode} />
                  </Route>
                  <Route path="/issuedtokens/:address?">{params=>
                    <IssuedTokens provider={provider} roles={roles} signedInAddress={params.address||signedInAddress} displayAddress={params.address} />
                  }</Route>
                  <Route path="/emissionsrequests">
                    <EmissionsRequests provider={provider} roles={roles} signedInAddress={signedInAddress} />
                  </Route>
                  <Route path="/pendingemissions/:uuid">{params=>
                    <PendingEmissions provider={provider} roles={roles} signedInAddress={signedInAddress} uuid={params.uuid} signedInWallet = {signedInWallet}/>
                  }</Route>
                  <Route path="/transfer">
                    <TransferForm provider={provider} roles={roles} />
                  </Route>
                  <Route path="/retire">
                    <RetireForm provider={provider} roles={roles} />
                  </Route>
                  <Route path="/track">
                    <TrackForm provider={provider} registeredTracker={registeredTracker}/>
                  </Route>
                  <Route path="/access-control">
                    <AccessControlForm ref={accessControlRef} provider={provider} providerRefresh={refresh} signedInAddress={signedInAddress} roles={roles} limitedMode={limitedMode} signedInWallet={signedInWallet} />
                  </Route>
                  <Route path="/reset-password">
                    <ChangePassword></ChangePassword>
                  </Route>
                  <Route path="/sign-up">
                    <SignUp></SignUp>
                  </Route>
                  <Route path="/sign-in">
                    <SignIn loadWalletInfo={loadWalletInfo} />
                  </Route>
                  <Route path="/export-pk">
                    <ExportPk signedInWallet={signedInWallet} logoutOfWalletInfo={logoutOfWalletInfo} />
                  </Route>
                  <Route>
                    <Redirect to="/dashboard" />
                  </Route>
                </Switch>
              </Suspense>
            </Tab.Content>
          </Tab.Container>
          <div className="my-5"></div>
        </Container>

      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
