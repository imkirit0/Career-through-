#!/usr/bin/env python3
"""Generate data/cloud-fundamentals-questions.csv: 5,000 multiple-choice questions.

Written for the existing `cloud-fundamentals` skill and its four topics. The questions are
provider-neutral. Numeric answers (availability, capacity, cost, CIDR maths, quorums) are
computed here; rule questions (access policies, network ACLs, route tables, autoscaling) are
decided by small evaluators in this file; definitions come from the fact lists.

Needs only the standard library.   Run:  python3 scripts/gen-cloud-questions.py
"""
import fnmatch
import ipaddress
import math
from pathlib import Path

from qbank import Bank, Q, ask, facts, g, ints, nq, uniq

OUT = Path(__file__).resolve().parent.parent / "data" / "cloud-fundamentals-questions.csv"

# topicIds of the `cloud-fundamentals` skill in src/content/skills/devops.ts, in teaching order
MD, CS, IAM, SC = ("cloud-fundamentals-models", "cloud-fundamentals-compute-storage",
                   "cloud-fundamentals-iam", "cloud-fundamentals-scaling-cost")
bank = Bank("cloud-fundamentals", "cloud", [MD, CS, IAM, SC])
t = bank.t


def seq(xs):
    return ", ".join(map(str, xs))


def pick(r, prompt, pairs):
    """Scenario -> label questions where the options are always the same small set of labels."""
    text, ans = r.choice(pairs)
    labels = list(dict.fromkeys(a for _, a in pairs))
    return f"{prompt}\n\n{text}", ans, [x for x in labels if x != ans]


# ───────────────────────── Service models and shared responsibility ─────────────────────────

SVC = "Service and deployment models"


@t(MD, SVC, 1)
def _(r):
    p, a, w = pick(r, "Which cloud service model is this?", [
        ("Renting virtual machines and installing your own operating system and software.", "IaaS"),
        ("Pushing code to a platform that runs, scales and patches it for you.", "PaaS"),
        ("Using a web-based email service through the browser.", "SaaS"),
        ("Uploading a single function that runs only when an event triggers it.", "FaaS"),
        ("Renting raw block storage and virtual networks to build on.", "IaaS"),
        ("A managed database where the provider handles backups and patching.", "PaaS"),
        ("Subscribing to an online CRM that the vendor hosts and updates.", "SaaS"),
        ("Code that is billed per invocation and scales to zero when idle.", "FaaS"),
        ("A hosted environment for deploying web apps without managing servers or runtimes.", "PaaS"),
        ("A video-conferencing tool used entirely through a browser or app.", "SaaS"),
        ("Virtual servers where you choose the CPU, memory and disk and manage the operating system yourself.", "IaaS"),
        ("An image-resize handler that runs whenever a file is uploaded.", "FaaS"),
    ])
    return Q(p, a, w, "IaaS rents raw infrastructure, PaaS runs your code on a managed platform, SaaS is finished software you simply use, and FaaS runs individual functions on demand.")


@t(MD, SVC, 1)
def _(r):
    p, a, w = pick(r, "Which cloud deployment model is this?", [
        ("Infrastructure owned by a provider and shared by many unrelated customers over the internet.", "Public cloud"),
        ("Infrastructure used by a single organisation, whether on its own premises or hosted for it.", "Private cloud"),
        ("A company keeps sensitive data on its own servers but bursts to a provider during peak demand.", "Hybrid cloud"),
        ("Several hospitals share infrastructure built to meet their common compliance rules.", "Community cloud"),
        ("A start-up runs everything on a large provider's shared platform and owns no hardware.", "Public cloud"),
        ("A bank runs a cloud platform in its own data centre for its own teams only.", "Private cloud"),
        ("An on-premises data centre is linked to a provider so workloads can move between the two.", "Hybrid cloud"),
        ("Universities in one region pool resources into a platform that only they can use.", "Community cloud"),
    ])
    return Q(p, a, w, "A public cloud is shared by many customers, a private cloud serves one organisation, a community cloud serves a group with common needs, and a hybrid cloud combines private and public.")


LAYERS = ["Applications", "Data", "Runtime", "Middleware", "Operating system", "Virtualisation", "Servers", "Storage", "Networking"]
CUSTOMER = {"On-premises": LAYERS, "IaaS": LAYERS[:5], "PaaS": LAYERS[:2], "SaaS": []}


@t(MD, "Shared responsibility", 2)
def _(r):
    why = "Going from on-premises to IaaS to PaaS to SaaS, the provider takes over more of the stack. In IaaS the customer still manages the operating system and everything above it; in PaaS only the applications and data."
    form = r.randint(0, 3)
    if form == 0:
        model = r.choice(["IaaS", "PaaS"])
        mine, theirs = CUSTOMER[model], [x for x in LAYERS if x not in CUSTOMER[model]]
        return Q(f"In the {model} model, which of these does the customer manage?", r.choice(mine), r.sample(theirs, 3), why)
    if form == 1:
        mine, theirs = CUSTOMER["IaaS"], LAYERS[5:]
        return Q("In the IaaS model, which of these does the cloud provider manage?", r.choice(theirs), r.sample(mine, 3), why)
    if form == 2:
        model = r.choice(list(CUSTOMER))
        return nq(f"A stack has nine layers: {seq(LAYERS)}. How many of them does the customer manage in the {model} model?", len(CUSTOMER[model]), [9 - len(CUSTOMER[model]), 5, 2, 7], why)
    text, ans = r.choice([("only its applications and data", "PaaS"), ("the operating system and everything above it, but no hardware", "IaaS"),
                          ("nothing at all; it only uses the finished software", "SaaS"), ("every layer, including the physical servers", "On-premises"),
                          ("its code and data, leaving runtimes and patching to the provider", "PaaS"), ("virtual machines, including their patching and middleware", "IaaS")])
    return Q(f"A team wants to manage {text}. Which model fits?", ans, [m for m in CUSTOMER if m != ans], why)


facts(bank, MD, "Cloud concepts", 1, [
    [("A region", "A geographic area that contains several isolated data-centre locations."),
     ("An availability zone", "One or more data centres within a region, with independent power and networking."),
     ("An edge location", "A site close to users that caches content to reduce latency."),
     ("A virtual machine", "A software-emulated computer that runs its own operating system on shared hardware."),
     ("A hypervisor", "Software that creates and runs virtual machines by sharing one physical host between them."),
     ("A container", "A lightweight package of an application and its dependencies that shares the host's operating-system kernel."),
     ("A virtual private cloud", "A logically isolated network inside a public cloud, with its own address range."),
     ("A subnet", "A slice of a network's address range, usually placed in one availability zone."),
     ("A NAT gateway", "A service that lets instances in a private subnet reach the internet without being reachable from it."),
     ("A load balancer", "A service that spreads incoming requests across several healthy servers."),
     ("A content delivery network", "A network of edge servers that serve cached copies of content from locations near the user."),
     ("Object storage", "Storage that keeps data as whole objects with metadata in a flat namespace, reached over an API."),
     ("Block storage", "Storage presented to a server as a raw disk volume, suitable for file systems and databases."),
     ("File storage", "Storage shared over a network as a hierarchy of folders and files."),
     ("Infrastructure as code", "Defining servers, networks and other resources in version-controlled files instead of setting them up by hand.")],
    [("Elasticity", "Automatically adding and removing resources as demand rises and falls."),
     ("Scalability", "The ability of a system to handle more load by adding resources."),
     ("High availability", "Designing a system so that it keeps running with very little downtime."),
     ("Fault tolerance", "A system continuing to work correctly even when some of its components fail."),
     ("Multitenancy", "Many customers sharing the same physical infrastructure while being isolated from one another."),
     ("Pay-as-you-go pricing", "Paying only for the resources actually used, with no long-term commitment."),
     ("A reserved instance", "A discounted price in exchange for committing to use capacity for one or three years."),
     ("A spot instance", "Spare capacity sold at a deep discount that the provider can reclaim at short notice."),
     ("Capital expenditure (CapEx)", "Money spent up front to buy assets such as servers and buildings."),
     ("Operational expenditure (OpEx)", "Ongoing spending on services as they are used."),
     ("A service level agreement", "A provider's formal commitment to a level of service, such as 99.9% uptime."),
     ("Vendor lock-in", "Difficulty moving to another provider because a system depends on one provider's proprietary services."),
     ("Serverless computing", "Running code without managing servers; the provider allocates resources per request and bills for use."),
     ("Autoscaling", "Automatically changing the number of running instances according to a metric such as CPU use."),
     ("The shared responsibility model", "The division of security duties between the cloud provider and the customer."),
     ("Recovery time objective (RTO)", "The longest acceptable time to restore a service after a failure."),
     ("Recovery point objective (RPO)", "The largest acceptable amount of data loss, measured as time before the failure.")],
])


# ───────────────────────── Compute and storage ─────────────────────────

VN = "Virtual networks and CIDR"


@t(CS, VN, 2)
def _(r):
    p, q, a = r.randint(20, 28), r.randint(17, 28), r.randint(0, 255)
    return ask(r, [
        (f"A cloud subnet is 10.{a}.0.0/{p}. The provider reserves 5 addresses in every subnet. How many addresses can be given to instances?", 2 ** (32 - p) - 5, [2 ** (32 - p) - 2, 2 ** (32 - p), 2 ** (31 - p) - 5 if p < 28 else 20]),
        (f"A virtual network uses 10.{a}.0.0/16. How many /{q} subnets can it be divided into?", 2 ** (q - 16), [2 ** (32 - q), q - 16, 2 ** (q - 16) - 2 if q > 17 else 4]),
        (f"How many IP addresses does the CIDR block 10.{a}.0.0/{p} contain?", 2 ** (32 - p), [2 ** (32 - p) - 2, 2 ** p if p < 22 else 2 ** (31 - p), 32 - p]),
        (f"A subnet must hold {2 ** (32 - p) - 5 - r.randint(0, 2 ** (31 - p) - 1)} instances and the provider reserves 5 addresses per subnet. How many addresses must the smallest suitable CIDR block contain?", 2 ** (32 - p), [2 ** (31 - p), 2 ** (33 - p), 2 ** (32 - p) - 5]),
        (f"Which prefix length gives a block with twice as many addresses as a /{p}?", p - 1, [p + 1, p - 2, p * 2]),
    ], "A /p block has 2^(32 - p) addresses. Cloud providers reserve a few in every subnet (five here), so the usable count is 2^(32 - p) - 5. Shortening the prefix by one bit doubles the block; a /16 holds 2^(q - 16) subnets of size /q.")


@t(CS, VN, 3)
def _(r):
    p, a = r.randint(16, 22), r.randint(0, 200)
    vpc = ipaddress.ip_network(f"10.{a}.0.0/{p}", strict=False)
    span = vpc.num_addresses // 256
    inside = ipaddress.ip_network(f"{vpc.network_address + 256 * r.randrange(span)}/24")
    outside = [ipaddress.ip_network(f"{vpc.broadcast_address + 1 + 256 * r.randint(0, 9)}/24"), ipaddress.ip_network(f"10.{(a + r.randint(3, 40)) % 256}.{r.randint(0, 255)}.0/24"),
               ipaddress.ip_network(f"172.{r.randint(16, 31)}.{r.randint(0, 255)}.0/24"), ipaddress.ip_network(f"192.168.{r.randint(0, 255)}.0/24")]
    outside = [str(n) for n in outside if not n.overlaps(vpc)]
    x = r.randint(1, 250)
    routes = [(f"10.{a}.0.0/16", "The local route"), (f"10.{a}.{x}.0/24", "The firewall appliance"), ("172.16.0.0/12", "The VPN gateway"), ("0.0.0.0/0", "The internet gateway")]
    dest = r.choice([f"10.{a}.{x}.{r.randint(1, 254)}", f"10.{a}.{(x + r.randint(1, 5)) % 256}.{r.randint(1, 254)}", f"172.{r.randint(16, 31)}.{r.randint(0, 255)}.{r.randint(1, 254)}",
                     f"{r.choice([8, 52, 142, 203])}.{r.randint(0, 255)}.{r.randint(0, 255)}.{r.randint(1, 254)}", f"10.{(a + 1) % 256}.{x}.{r.randint(1, 254)}"])
    best = max((n for n in routes if ipaddress.ip_address(dest) in ipaddress.ip_network(n[0])), key=lambda n: ipaddress.ip_network(n[0]).prefixlen)
    table = "\n".join(f"{n:<16} → {tgt[4:] if tgt.startswith('The ') else tgt}" for n, tgt in routes)
    form = r.randint(0, 2)
    if form == 0 and len(outside) >= 3:
        return Q(f"A virtual network has the address range {vpc}. Which of these subnets lies inside it?", str(inside), outside[:3],
                 "A subnet lies inside a network when all of its addresses fall within the network's range, that is, when its first address shares the network's prefix bits.")
    if form == 1 and len(outside) >= 3:
        wide = ipaddress.ip_network(f"10.{a}.0.0/{max(p - 2, 8)}", strict=False)
        return Q(f"A new network must not overlap the existing range {vpc}. Which of these candidate ranges overlaps it?", str(wide if r.random() < 0.5 else inside), outside[:3],
                 "Two CIDR blocks overlap when one contains the other; blocks of different sizes can never partly overlap. Overlapping ranges cannot be peered or routed between.")
    return Q(f"A route table has these entries:\n\n{table}\n\nWhere is traffic for {dest} sent?", best[1], [tgt for _, tgt in routes if tgt != best[1]],
             "When several routes match a destination, the most specific one (the longest prefix) wins. 0.0.0.0/0 matches everything and is used only when nothing more specific does.")


STG = "Storage and data"
TIERS = [("Hot", 0.023, 0.0), ("Cool", 0.0125, 0.01), ("Cold", 0.004, 0.03), ("Archive", 0.001, 0.09)]


@t(CS, STG, 2)
def _(r):
    gb = r.choice([100, 200, 500, 1000, 2000, 5000])
    out = int(gb * r.choice([0, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]))
    cost = {name: round(gb * s + out * x, 2) for name, s, x in TIERS}
    low = min(cost.values())
    if list(cost.values()).count(low) > 1:
        return None
    prices = "\n".join(f"{name:<8} ${s} per GB stored each month, ${x} per GB retrieved" for name, s, x in TIERS)
    base = f"Object storage tiers:\n\n{prices}\n\nA team keeps {gb} GB stored and reads back {out} GB in total each month."
    tier = r.choice(TIERS)[0]
    why = "Monthly cost = GB stored × storage price + GB retrieved × retrieval price. Colder tiers are cheaper to store in but dearer to read from, so the best tier depends on how often the data is read."
    if r.random() < 0.5:
        return Q(f"{base} Which tier is cheapest?", min(cost, key=cost.get), [n for n in cost if n != min(cost, key=cost.get)], why)
    return nq(f"{base} What is the monthly cost in the {tier} tier, in dollars?", cost[tier], [v for n, v in cost.items() if n != tier], why)


@t(CS, STG, 2)
def _(r):
    n, w, gb, k, d, par = r.choice([3, 5, 7]), 0, r.choice([50, 120, 400, 800, 1500]), r.randint(2, 4), r.choice([4, 6, 8, 10]), r.choice([2, 3, 4])
    w = r.randint(n // 2 + 1, n)
    full, inc, days = r.choice([100, 200, 500, 800]), r.choice([5, 10, 20, 40]), r.randint(3, 30)
    iops, blk, tb, mbps = r.choice([500, 1000, 3000, 8000, 16000]), r.choice([4, 8, 16, 64, 256]), r.choice([1, 2, 5, 10]), r.choice([100, 200, 500, 1000])
    return ask(r, [
        (f"A database keeps {n} replicas and a write must be confirmed by {w} of them. What is the smallest number of replicas a read must consult to be sure of seeing the latest write?", n - w + 1, [w, n, n - w]),
        (f"A database keeps {n} replicas and a write must be confirmed by {w} of them. How many replicas can be down while writes still succeed?", n - w, [w, n - w + 1, n // 2 if n // 2 != n - w else n]),
        (f"{gb} GB of data is stored with a replication factor of {k}. How many GB of raw storage does it use?", gb * k, [gb, gb + k, gb * (k - 1)]),
        (f"{gb} GB of data is stored with erasure coding that adds {par} parity fragments to every {d} data fragments. How many GB of raw storage does it use?", gb * (d + par) / d, [gb * par, gb * (d + par), float(gb)]),
        (f"A volume has one full snapshot of {full} GB followed by {days} daily incremental snapshots of {inc} GB each. How many GB do the snapshots occupy in total?", full + days * inc, [full * (days + 1), days * inc, full + inc]),
        (f"A disk delivers {iops} IOPS with a block size of {blk} KB. What is its throughput in MB per second (1 MB = 1024 KB)?", iops * blk / 1024, [float(iops * blk), iops / blk, iops * blk / 1000 if iops * blk % 1024 else iops * blk / 512]),
        (f"About how many hours does it take to upload {tb} TB over a steady {mbps} Mbps link? (1 TB = 8,000,000 megabits.)", round(tb * 8_000_000 / mbps / 3600, 2), [round(tb * 1_000_000 / mbps / 3600, 2), round(tb * 8_000_000 / mbps / 60, 2), round(tb * 8_000 / mbps, 2)]),
    ], "With N replicas and a write quorum W, a read quorum of N - W + 1 always overlaps the latest write, and writes survive N - W failures. Replication multiplies storage by the replica count; erasure coding multiplies it by (data + parity) / data.")


@t(CS, STG, 1)
def _(r):
    p, a, w = pick(r, "Which kind of storage fits best?", [
        ("Millions of user-uploaded photos served over HTTP.", "Object storage"),
        ("The boot disk of a virtual machine.", "Block storage"),
        ("A shared folder that several servers mount at the same time.", "File storage"),
        ("Compliance records that must be kept for seven years and are almost never read.", "Archive storage"),
        ("The data volume of a relational database that needs low-latency random I/O.", "Block storage"),
        ("Static website assets and backups written and read through an API.", "Object storage"),
        ("Home directories shared by a team of Linux users.", "File storage"),
        ("Old log files retained as cheaply as possible, where retrieval may take hours.", "Archive storage"),
    ])
    return Q(p, a, w, "Object storage suits large amounts of unstructured data reached over an API; block storage is a raw disk for one server; file storage is a shared folder tree; archive storage trades slow retrieval for the lowest price.")


K8 = "Containers and orchestration"
TYPES = [("small", 2, 4), ("medium", 2, 8), ("large", 4, 16), ("xlarge", 8, 32)]


@t(CS, K8, 3)
def _(r):
    ncpu, nmem, pcpu, pmem = r.choice([2000, 4000, 8000, 16000]), r.choice([8, 16, 32, 64]), r.choice([100, 250, 500, 750, 1000]), r.choice([0.5, 1, 2, 4])
    per = min(ncpu // pcpu, int(nmem // pmem))
    reps, surge, unav, zones = r.randint(4, 40), r.randint(1, 3), r.randint(0, 2), r.choice([2, 3])
    cur, metric, target = r.randint(2, 12), r.choice([40, 60, 75, 90, 120, 150]), r.choice([50, 60, 80])
    c, m = r.choice([1, 2, 3, 4, 6, 8]), r.choice([2, 4, 6, 8, 12, 16, 24, 32])
    fit = next(name for name, vc, mem in TYPES if vc >= c and mem >= m)
    listing = "; ".join(f"{name} = {vc} vCPU and {mem} GB" for name, vc, mem in TYPES)
    return ask(r, [
        (f"A node offers {ncpu} millicores of CPU and {nmem} GB of memory. Each pod requests {pcpu} millicores and {g(pmem)} GB. How many of these pods fit on the node?", per, [ncpu // pcpu if ncpu // pcpu != per else int(nmem // pmem) + 1, int(nmem // pmem) if int(nmem // pmem) != per else ncpu // pcpu + 1, per + 1]),
        (f"Each node can hold {per} pods of a service. How many nodes are needed to run {reps * 3} replicas?", -(-reps * 3 // per), [reps * 3 // per if reps * 3 % per else reps * 3 // per + 1, reps * 3 * per, -(-reps * 3 // per) + 2]),
        (f"A deployment of {reps} replicas does a rolling update with maxSurge = {surge} and maxUnavailable = {unav}. What is the largest number of pods that can exist during the update?", reps + surge, [reps, reps + surge + unav, reps - unav if unav else reps + 2 * surge]),
        (f"A deployment of {reps} replicas does a rolling update with maxSurge = {surge} and maxUnavailable = {unav + 1}. What is the smallest number of pods guaranteed to be available during the update?", reps - unav - 1, [reps, reps + surge, reps - surge - unav - 1 if reps - surge - unav - 1 != reps - unav - 1 else reps - 3]),
        (f"An autoscaler uses  desired = ceil(current replicas × current metric ÷ target metric). There are {cur} replicas at {metric}% average CPU and the target is {target}%. How many replicas does it ask for?", math.ceil(cur * metric / target), [math.floor(cur * metric / target) if cur * metric % target else math.ceil(cur * metric / target) + 1, cur, math.ceil(cur * target / metric)]),
        (f"{reps * zones} replicas are spread evenly over {zones} availability zones. One zone fails. How many replicas are still running?", reps * (zones - 1), [reps * zones, reps, reps * zones - 1]),
        (f"Instance types: {listing}. A workload needs {c} vCPU and {m} GB of memory. Which is the smallest type that fits?", fit, [name for name, _, _ in TYPES if name != fit]),
    ], "A node fits as many pods as its scarcer resource allows. During a rolling update there are at most replicas + maxSurge pods and at least replicas - maxUnavailable available. The autoscaler scales in proportion to how far the metric is from its target, rounding up.")


SLS = "Serverless and managed services"


@t(CS, SLS, 2)
def _(r):
    rps, dur, n, ms, mem = r.choice([20, 50, 100, 200, 500, 1200]), r.choice([0.1, 0.2, 0.5, 1, 2]), r.choice([100_000, 500_000, 1_000_000, 2_000_000, 5_000_000]), r.choice([100, 200, 500, 1000]), r.choice([128, 256, 512, 1024])
    backlog, cons, prod = r.choice([600, 1200, 6000, 9000, 24000]), r.choice([50, 80, 120, 200]), r.choice([10, 20, 30, 40])
    total, hit = r.choice([10_000, 50_000, 200_000, 1_000_000]), r.choice([60, 75, 80, 90, 95])
    reads, each = r.randint(500, 9000), r.choice([400, 500, 1000, 1500])
    return ask(r, [
        (f"A function receives {rps} requests per second and each takes {g(dur)} seconds. About how many copies of it run at the same time?", rps * dur, [rps / dur, float(rps), rps * dur * 60]),
        (f"A function is invoked {n:,} times a month. Each run lasts {ms} ms with {mem} MB of memory. How many GB-seconds does it use? (1 GB = 1024 MB.)", n * ms / 1000 * mem / 1024, [n * ms / 1000, n * ms * mem / 1024, n * mem / 1024]),
        (f"A function is invoked {n:,} times a month and requests are billed at $0.20 per million. What is the monthly request charge, in dollars?", n / 1_000_000 * 0.2, [n / 1000 * 0.2, n * 0.2, n / 1_000_000]),
        (f"A queue holds {backlog} messages. Workers remove {cons} per second while {prod} new ones arrive per second. How many seconds until the queue is empty?", backlog / (cons - prod), [backlog / cons, backlog / (cons + prod), backlog / prod]),
        (f"A CDN receives {total:,} requests and serves {hit}% of them from its cache. How many reach the origin server?", total * (100 - hit) / 100, [total * hit / 100, float(total), total / (100 - hit)]),
        (f"A database must serve {reads} read queries per second and each read replica handles {each}. How many read replicas are needed?", -(-reads // each), [reads // each if reads % each else reads // each + 1, reads * each, -(-reads // each) + 2]),
    ], "Concurrency = requests per second × duration. Serverless compute is billed in GB-seconds: runs × seconds × memory in GB. A backlog drains at the difference between the consume and arrival rates, and a cache hit ratio of h% leaves (100 - h)% for the origin.")


# ───────────────────────── Identity and access management ─────────────────────────

POL = "Access policies"
REQ = [("storage:Read", "reports/2026/q1.csv"), ("storage:Write", "reports/2026/q1.csv"), ("storage:Delete", "reports/2026/q1.csv"), ("storage:Read", "logs/app.log"),
       ("storage:Delete", "logs/app.log"), ("storage:Write", "images/logo.png"), ("compute:Start", "vm/web-1"), ("compute:Stop", "vm/web-1"), ("storage:List", "reports/2025/q4.csv")]
ACT = ["storage:Read", "storage:Write", "storage:Delete", "storage:List", "storage:*", "compute:Start", "compute:Stop", "compute:*", "*"]
RES = ["reports/*", "reports/2026/*", "logs/*", "images/*", "vm/*", "*"]


def decide(stmts, action, resource):
    hit = [e for e, a, res in stmts if fnmatch.fnmatchcase(action, a) and fnmatch.fnmatchcase(resource, res)]
    return "deny" if "DENY" in hit else "allow" if "ALLOW" in hit else "none"


assert decide([("ALLOW", "storage:*", "*"), ("DENY", "storage:Delete", "logs/*")], "storage:Delete", "logs/app.log") == "deny"
assert decide([("ALLOW", "storage:Read", "reports/*")], "storage:Read", "reports/2026/q1.csv") == "allow"
assert decide([("ALLOW", "storage:Read", "reports/*")], "storage:Write", "reports/2026/q1.csv") == "none"


@t(IAM, POL, 2)
def _(r):
    action, resource = r.choice(REQ)
    stmts = [(r.choice(["ALLOW", "ALLOW", "DENY"]), r.choice(ACT), r.choice(RES)) for _ in range(3)]
    if len(set(stmts)) < 3:
        return None
    listing = "\n".join(f"{i}. {e:<5} {a:<15} on {res}" for i, (e, a, res) in enumerate(stmts, 1))
    opts = {"allow": "Allowed", "deny": "Denied: an explicit DENY matches", "none": "Denied: no statement allows it", "x": "Allowed: an ALLOW overrides the DENY"}
    ans = opts[decide(stmts, action, resource)]
    return Q(f"An identity has this policy (* matches anything):\n\n{listing}\n\nIt requests  {action}  on  {resource}. What is the result?", ans, [v for v in opts.values() if v != ans],
             "A request is denied by default. It is allowed only if some ALLOW statement matches both the action and the resource, and an explicit DENY that matches always wins over any ALLOW.")


@t(IAM, POL, 3)
def _(r):
    concrete = ["storage:Read", "storage:Write", "storage:Delete", "storage:List", "compute:Start", "compute:Stop"]
    names = r.sample(["Developers", "Auditors", "Operators", "Analysts", "Support"], 2)
    grants = [sorted(r.sample(concrete, r.randint(1, 3))) for _ in names]
    denied = r.choice([None, None, r.choice(concrete)])
    can = lambda a: a != denied and any(a in gset for gset in grants)
    yes, no = [a for a in concrete if can(a)], [a for a in concrete if not can(a)]
    listing = "\n".join(f"{n} may: {seq(gr)}" for n, gr in zip(names, grants)) + (f"\nA policy attached to the user explicitly denies: {denied}" if denied else "")
    base = f"A user belongs to two groups.\n\n{listing}\n\n"
    why = "A user's permissions are the union of everything granted by all of their groups, minus anything that is explicitly denied. Anything not granted by any group is denied by default."
    form = r.randint(0, 2)
    if form == 0 and len(yes) >= 3 and no:
        return Q(base + "Which of these actions is the user NOT able to perform?", r.choice(no), r.sample(yes, 3), why)
    if form == 1 and len(no) >= 3 and yes:
        return Q(base + "Which of these actions is the user able to perform?", r.choice(yes), r.sample(no, 3), why)
    return nq(base + f"How many of these six actions can the user perform: {seq(concrete)}?", len(yes), [len(no), len(set(grants[0]) | set(grants[1])) if denied else len(grants[0]) + len(grants[1]), len(grants[0])], why)


@t(IAM, POL, 2)
def _(r):
    svc, act = r.choice([("storage", "Read"), ("storage", "Write"), ("storage", "List"), ("compute", "Start"), ("compute", "Stop"), ("storage", "Delete")])
    folder = r.choice(["reports", "logs", "images", "backups"]) if svc == "storage" else "vm"
    other = "Write" if act != "Write" else "Read"
    if svc == "compute":
        other = "Stop" if act == "Start" else "Start"
    need = {"Read": "read", "Write": "write", "List": "list", "Delete": "delete", "Start": "start", "Stop": "stop"}[act]
    what = f"{need} objects under {folder}/" if svc == "storage" else f"{need} virtual machines"
    return Q(f"A job only needs to {what}, and nothing else. Which policy follows the principle of least privilege?", f"ALLOW {svc}:{act} on {folder}/*",
             [f"ALLOW {svc}:* on {folder}/*", f"ALLOW {svc}:{act} on *", "ALLOW * on *", f"ALLOW {svc}:{other} on {folder}/*"],
             "Least privilege grants exactly the action needed on exactly the resources needed. Wildcards on the action or the resource grant more than the job requires, and a different action does not let it do its work.")


NAR = "Network access rules"
SRC = [("0.0.0.0/0", "anywhere"), ("10.0.0.0/16", "the internal network"), ("203.0.113.0/24", "the office range")]


@t(IAM, NAR, 3)
def _(r):
    ports = r.sample([22, 80, 443, 3306, 5432, 8080], 3)
    rules = [(100 * (i + 1), r.choice(["ALLOW", "ALLOW", "DENY"]), r.choice(ports), r.choice(SRC)[0]) for i in range(3)]
    ip = r.choice([f"10.0.{r.randint(0, 255)}.{r.randint(1, 254)}", f"203.0.113.{r.randint(1, 254)}", f"{r.choice([8, 52, 142, 198])}.{r.randint(0, 255)}.{r.randint(0, 255)}.{r.randint(1, 254)}"])
    port = r.choice(ports + [r.choice([25, 3389])])
    match = next((rule for rule in rules if rule[2] == port and ipaddress.ip_address(ip) in ipaddress.ip_network(rule[3])), None)
    listing = "\n".join(f"Rule {n}: {e:<5} TCP port {p:<5} from {c}" for n, e, p, c in rules) + "\nDefault:  DENY  everything else"
    name = lambda rule: f"Rule {rule[0]} ({rule[1]})"
    ans = name(match) if match else "The default rule (DENY)"
    return Q(f"A network ACL checks its rules in number order and stops at the first match:\n\n{listing}\n\nA TCP packet arrives from {ip} for port {port}. Which rule decides what happens to it?", ans,
             [x for x in [name(rule) for rule in rules] + ["The default rule (DENY)"] if x != ans],
             "A network ACL is evaluated from the lowest rule number upwards and the first rule whose port and source range match decides the outcome; later rules are never consulted. If nothing matches, the default rule denies the packet.")


@t(IAM, NAR, 2)
def _(r):
    ports = r.sample([22, 80, 443, 3306, 5432, 8080], 3)
    rules = [(p, r.choice(SRC)[0]) for p in ports]
    ip = r.choice([f"10.0.{r.randint(0, 255)}.{r.randint(1, 254)}", f"203.0.113.{r.randint(1, 254)}", f"{r.choice([8, 52, 142, 198])}.{r.randint(0, 255)}.{r.randint(0, 255)}.{r.randint(1, 254)}"])
    listing = "\n".join(f"ALLOW TCP port {p:<5} from {c}" for p, c in rules)
    ok = [p for p, c in rules if ipaddress.ip_address(ip) in ipaddress.ip_network(c)]
    form = r.randint(0, 1)
    why = "A security group only contains ALLOW rules and denies everything else. A connection is admitted when some rule matches both its port and its source address."
    if form == 0:
        return nq(f"A security group has these inbound rules and denies everything else:\n\n{listing}\n\nA client at {ip} tries ports {seq(ports)}. On how many of them is it let in?", len(ok), [3 - len(ok), 3, 0], why)
    others = [25, 3389, 21, 8443]
    cands = [p for p in ports if p not in ok] + others
    if len(ok) != 1:
        return None
    return nq(f"A security group has these inbound rules and denies everything else:\n\n{listing}\n\nOn which port can a client at {ip} connect?", ok[0], cands[:3], why)


CRD = "Credentials and identity"
WORDS = ["Monsoon", "Kerala", "Coffee", "Harbour", "Lantern", "Pepper", "Mango", "Saffron"]


def complies(pw, n):
    return len(pw) >= n and any(c.isupper() for c in pw) and any(c.islower() for c in pw) and any(c.isdigit() for c in pw) and any(not c.isalnum() for c in pw)


assert complies("Monsoon#42", 10) and not complies("monsoon#42", 10) and not complies("Monsoon42", 8) and not complies("Mo#4", 8)


@t(IAM, CRD, 2)
def _(r):
    n, w, d, sym = r.randint(8, 12), r.choice(WORDS), r.randint(10, 99), r.choice("#@!$%")
    good = (w + sym + str(d)).ljust(n, "x") if len(w + sym + str(d)) < n else w + sym + str(d)
    bad = [w.lower() + sym + str(d) + "x" * n, w + str(d) + "x" * n, (w + sym + "x" * n), (w[:2] + sym + str(d))[:n - 1], w.upper() + sym + str(d) + "X" * n]
    bad = [b for b in bad if not complies(b, n)]
    rot, today, created = r.choice([30, 60, 90]), r.randint(100, 300), 0
    created = [today - r.randint(1, 150) for _ in range(5)]
    if not complies(good, n):
        return None
    return ask(r, [
        (f"A password policy requires at least {n} characters including an upper-case letter, a lower-case letter, a digit and a symbol. Which password complies?", good, r.sample(bad, 3)),
        (f"Access keys must be rotated every {rot} days. Today is day {today} and five keys were created on days {seq(created)}. How many are overdue (older than {rot} days)?", sum(today - c > rot for c in created), [sum(today - c <= rot for c in created), 5, 0]),
        (f"A temporary credential is issued at minute {today} and is valid for {rot} minutes. At which minute does it expire?", today + rot, [today, rot, today + rot * 60]),
        (f"An account locks after {n - 5} failed sign-ins in a row. A user fails {n - 6} times, succeeds once, then fails {n - 6} more times. How many consecutive failures count towards the lock now?", n - 6, [2 * (n - 6), n - 5, 0]),
    ], "A password must satisfy every rule of the policy at once. A key is overdue when today minus its creation day exceeds the rotation period. A successful sign-in resets the failed-attempt counter.")


facts(bank, IAM, CRD, 1, [
    [("Authentication", "Proving who you are, for example with a password or a security key."),
     ("Authorisation", "Deciding what an authenticated identity is allowed to do."),
     ("Multi-factor authentication", "Requiring two or more different kinds of proof, such as a password and a one-time code."),
     ("The principle of least privilege", "Granting only the permissions needed for a task, and nothing more."),
     ("An IAM role", "A set of permissions that an identity or service assumes temporarily, with no long-term credentials of its own."),
     ("An IAM group", "A collection of users who all receive the permissions attached to it."),
     ("An IAM policy", "A document that lists which actions are allowed or denied on which resources."),
     ("A service account", "An identity used by an application or machine rather than by a person."),
     ("Single sign-on", "Logging in once with one identity provider to reach many separate applications."),
     ("Temporary credentials", "Short-lived keys that expire automatically, limiting the damage if they leak."),
     ("The root account", "The identity with unrestricted access to everything in the account; it should not be used for daily work."),
     ("Role-based access control", "Granting permissions to roles and then assigning roles to people, instead of granting them one by one.")],
    [("Encryption at rest", "Protecting stored data by encrypting it on disk."),
     ("Encryption in transit", "Protecting data as it moves across a network, for example with TLS."),
     ("A key management service", "A managed service that creates, stores and controls the use of encryption keys."),
     ("An audit log", "A record of who did what and when, used to investigate and prove activity."),
     ("A security group", "A stateful virtual firewall attached to an instance; replies to an allowed connection are allowed automatically."),
     ("A network ACL", "A stateless firewall at the subnet boundary whose numbered rules are checked in order."),
     ("A secrets manager", "A service that stores passwords and API keys securely and hands them to applications at run time."),
     ("A bastion host", "A hardened server that is the only entry point for administrators into a private network.")],
])


# ───────────────────────── Availability, scaling and cost ─────────────────────────

AV = "Availability and SLAs"


PERIODS = [("day", 1440), ("7-day week", 10080), ("30-day month", 43200), ("90-day quarter", 129600), ("365-day year", 525600)]


@t(SC, AV, 2)
def _(r):
    a = r.choice([95, 98, 99, 99.5, 99.9, 99.95, 99.99])
    (name, mins), (_, m2), (_, m3) = r.sample(PERIODS, 3)
    allowed = mins * (100 - a) / 100
    used, spent = r.randint(1, mins // 50), round(allowed * r.choice([0.1, 0.25, 0.5, 0.75]), 2)
    xs = r.sample([98, 99, 99.5, 99.9, 99.95, 99.99], r.randint(2, 3))
    chain = math.prod(x / 100 for x in xs) * 100
    low, n = r.choice([70, 75, 80, 85, 90, 95]), r.randint(2, 3)
    single, target = r.choice([80, 90, 95, 99]), r.choice([99, 99.9, 99.99, 99.999])
    need = next(k for k in range(1, 20) if 1 - (1 - single / 100) ** k >= target / 100 - 1e-12)
    up, down = r.randint(40, 2000), r.randint(1, 24)
    measured, mtbf = round((mins - used) / mins * 100, 2), round(up / (up + down) * 100, 2)
    forms = [
        (f"A service promises {a}% availability. How many minutes of downtime does that allow in a {name}?", round(allowed, 2), [round(m2 * (100 - a) / 100, 2), round(m3 * (100 - a) / 100, 2), round(allowed * 10, 2), round(mins * a / 100, 2)]),
        (f"A service promises {a}% availability over a {name} and has already been down for {g(spent)} minutes. How many more minutes of downtime can it have before breaking the promise?", round(allowed - spent, 2), [round(allowed, 2), spent, round(allowed + spent, 2)]),
        (f"A request passes through {len(xs)} services in a row, with availabilities of {seq(f'{g(x)}%' for x in xs)}. What is the availability of the whole chain, as a percentage to two decimal places?", round(chain, 2), [float(min(xs)), round(sum(xs) / len(xs), 2), float(max(xs))]),
        (f"{n} identical servers each have {low}% availability and the service works as long as at least one is up. What is the availability of the service, as a percentage to two decimal places?", round((1 - (1 - low / 100) ** n) * 100, 2), [float(low), round((low / 100) ** n * 100, 2), round((low + 100) / 2, 2)]),
        (f"One server is {single}% available. Servers fail independently and the service is up while at least one works. What is the smallest number of servers that reaches {g(target)}%?", need, [need + 1, need - 1 if need > 1 else 5, need * 2]),
    ]
    if measured < 100:
        forms.append((f"In a {name} a service was down for {used} minutes in total. What was its availability, as a percentage to two decimal places?", measured, [round(used / mins * 100, 2), round(100 - used / 100, 2), round((mins - 2 * used) / mins * 100, 2)]))
    if mtbf < 100:
        forms.append((f"A system runs for {up} hours between failures on average and takes {down} hour(s) to repair. What is its availability, as a percentage to two decimal places?", mtbf, [round(down / (up + down) * 100, 2), round((up - down) / up * 100, 2), round(up / (up + 2 * down) * 100, 2)]))
    return ask(r, forms, "Allowed downtime = period × (1 - availability). Components in series multiply their availabilities, so a chain is worse than its weakest part. Redundant components fail together only if all fail: 1 - (1 - a)^n. Availability = MTBF / (MTBF + MTTR).")


SCL = "Scaling and load balancing"


@t(SC, SCL, 2)
def _(r):
    load, cap, n0, lo, hi = r.randint(300, 9000), r.choice([150, 200, 250, 400, 500]), r.randint(2, 5), r.randint(1, 2), r.randint(6, 8)
    cpu = ints(r, 5, 10, 95)
    n, raw = n0, n0
    for c in cpu:
        step = 1 if c > 70 else -1 if c < 30 else 0
        n, raw = max(lo, min(hi, n + step)), raw + step
    k, servers, wts = r.randint(5, 60), r.randint(3, 5), uniq(r, 3, 1, 5)
    total = sum(wts) * r.choice([10, 20, 50])
    conns = uniq(r, 4, 3, 60)
    zones = r.choice([2, 3])
    need = -(-load // cap)
    return ask(r, [
        (f"Peak load is {load} requests per second and one instance handles {cap}. How many instances are needed?", need, [load // cap if load % cap else need + 1, need + 2, load * cap]),
        (f"Peak load is {load} requests per second and one instance handles {cap}. How many instances are needed if one spare is kept for failures (N + 1)?", need + 1, [need, need * 2, need + 2]),
        (f"An autoscaling group has {n0} instances, a minimum of {lo} and a maximum of {hi}. At each check it adds one instance if CPU is above 70% and removes one if it is below 30%. The readings are {seq(cpu)}%. How many instances are there at the end?", n, [raw if raw != n else n0 + 2, n0, sum(c > 70 for c in cpu) if sum(c > 70 for c in cpu) != n else hi]),
        (f"A round-robin load balancer has {servers} servers, numbered 1 to {servers}, and the first request goes to server 1. Which server gets request number {k}?", (k - 1) % servers + 1, [k % servers + 1 if k % servers + 1 != (k - 1) % servers + 1 else 1, servers, (k - 2) % servers + 1]),
        (f"A weighted round-robin load balancer sends traffic to servers A, B and C in the ratio {wts[0]}:{wts[1]}:{wts[2]}. Of {total} requests, how many go to B?", total * wts[1] // sum(wts), [total // 3, total * wts[0] // sum(wts), total * wts[2] // sum(wts)]),
        (f"A least-connections load balancer has servers with {seq(conns)} open connections, in the order A, B, C, D. Which server gets the next request?", "Server " + "ABCD"[conns.index(min(conns))], ["Server " + x for x in "ABCD" if x != "ABCD"[conns.index(min(conns))]]),
        (f"{need * zones} instances are spread evenly over {zones} availability zones. One zone fails. What percentage of the capacity remains?", round((zones - 1) / zones * 100, 2), [round(100 / zones, 2) if zones != 2 else 25.0, 100.0, 75.0 if zones != 4 else 80.0]),
        (f"A service needs {need} instances to carry its peak load and runs in {zones + 1} availability zones. How many instances must each zone hold so that the load is still carried when one zone fails?", -(-need // zones), [-(-need // (zones + 1)) if -(-need // (zones + 1)) != -(-need // zones) else need, need, -(-need // zones) + 2]),
    ], "Instances needed = load ÷ capacity, rounded up. An autoscaling group never goes below its minimum or above its maximum. Round robin cycles through the servers in order; weighted round robin shares requests in proportion to the weights. To survive losing one of z zones, the other z - 1 must carry the whole load.")


@t(SC, SCL, 1)
def _(r):
    p, a, w = pick(r, "What kind of scaling is this?", [
        ("Replacing a 4 vCPU server with a 16 vCPU one.", "Scaling up (vertical)"),
        ("Adding three more servers behind the load balancer.", "Scaling out (horizontal)"),
        ("Removing two servers from the pool at night.", "Scaling in (horizontal)"),
        ("Moving the database to an instance with half the memory.", "Scaling down (vertical)"),
        ("Doubling the RAM of the cache node.", "Scaling up (vertical)"),
        ("Going from 2 replicas of a service to 6.", "Scaling out (horizontal)"),
        ("Reducing a worker pool from 10 containers to 4.", "Scaling in (horizontal)"),
        ("Switching a virtual machine to a smaller instance size.", "Scaling down (vertical)"),
    ])
    return Q(p, a, w, "Vertical scaling changes the size of one machine (up or down). Horizontal scaling changes the number of machines (out or in).")


CST = "Cost and pricing"


@t(SC, CST, 2)
def _(r):
    rate, hours, count = r.choice([0.05, 0.1, 0.2, 0.4, 0.8]), r.choice([100, 240, 500, 720]), r.randint(1, 12)
    od, fac, up = r.choice([0.2, 0.4, 0.8]), r.choice([0.5, 0.6, 0.7, 0.75]), r.choice([200, 300, 600, 900])
    res = od / 2
    disc, gb, sp, eg, ep = r.choice([60, 70, 80, 90]), r.choice([100, 500, 2000, 8000]), r.choice([0.02, 0.025, 0.01]), r.choice([150, 400, 1000, 2500]), r.choice([0.05, 0.08, 0.09])
    vcpu, util = r.choice([8, 16, 32]), r.choice([10, 15, 20, 25])
    need = next(s for s in (2, 4, 8, 16, 32) if vcpu * util <= 60 * s)
    secs = r.choice([45, 90, 300, 900, 1800])
    h = r.choice([100, 200, 300, 450, 600, 720])
    plans = {"On-demand": round(0.2 * h, 2), "Reserved": 75.0, "Savings plan": round(30 + 0.08 * h, 2), "Dedicated host": round(0.5 * h, 2)}
    low = min(plans.values())
    forms = [
        (f"{count} instance(s) run for {hours} hours at ${g(rate)} per hour each. What is the total cost in dollars?", round(count * hours * rate, 2), [round(hours * rate, 2), round(count * rate, 2), round(count * hours * rate * 2, 2)]),
        (f"An instance costs ${g(od)} per hour on demand. A reserved plan costs ${up} up front plus ${g(res)} per hour. After how many hours of use does the reserved plan become the cheaper one?", round(up / (od - res)), [round(up / od), round(up / res / 4), up]),
        (f"An on-demand instance costs ${g(od)} per hour and the same instance reserved costs ${g(od * fac)} per hour. What percentage is saved by reserving?", round((1 - fac) * 100, 2), [round(fac * 100, 2), round((1 - fac) / fac * 100, 2), 45.0]),
        (f"A spot instance is {disc}% cheaper than the on-demand price of ${g(rate)} per hour. What does {hours} hours of spot capacity cost, in dollars?", round(rate * hours * (100 - disc) / 100, 2), [round(rate * hours * disc / 100, 2), round(rate * hours, 2), round(rate * (100 - disc) / 100, 2)]),
        (f"A bucket stores {gb} GB at ${sp} per GB a month and serves {eg} GB of downloads at ${ep} per GB. What is the monthly bill in dollars?", round(gb * sp + eg * ep, 2), [round(gb * sp, 2), round(eg * ep, 2), round((gb + eg) * sp, 2)]),
        (f"The first 100 GB of outbound data each month is free and the rest costs ${ep} per GB. What does {eg} GB of outbound data cost, in dollars?", round(max(eg - 100, 0) * ep, 2), [round(eg * ep, 2), round((eg + 100) * ep, 2), round(100 * ep, 2)]),
        (f"A {vcpu} vCPU instance averages {util}% CPU. Sizes of 2, 4, 8, 16 and 32 vCPU are available. What is the smallest size that keeps average CPU at or below 60% for the same work?", need, [vcpu, vcpu // 2 if vcpu // 2 != need else 32, 2 if need != 2 else 8]),
        (f"An instance is billed per second at ${g(rate * 9)} per hour. What does a job that runs for {secs} seconds cost, in dollars (to two decimal places)?", round(rate * 9 * secs / 3600, 2), [round(rate * 9, 2), round(rate * 9 * secs / 60, 2), round(rate * 9 * secs / 360, 2)]),
    ]
    if list(plans.values()).count(low) == 1 and r.random() < 0.2:
        ans = min(plans, key=plans.get)
        return Q(f"Options for one instance: On-demand at $0.20 per hour; Reserved at a flat $75 a month; Savings plan at $30 a month plus $0.08 per hour; Dedicated host at $0.50 per hour. The instance runs {h} hours a month. Which is cheapest?",
                 ans, [n for n in plans if n != ans], "Work out the monthly cost of each option for the hours actually used. Flat fees win at high usage; pay-per-hour wins at low usage.")
    return ask(r, forms, "Cost = quantity × unit price, added up over every charge (compute hours, storage, outbound data). A commitment or reservation is worth it once the usage passes the break-even point: upfront cost ÷ hourly saving.")


REL = "Reliability and recovery"
DR = ["Backup and restore", "Pilot light", "Warm standby", "Multi-site active-active"]


@t(SC, REL, 2)
def _(r):
    every, bh, fh, fm = r.choice([1, 2, 4, 6, 12, 24]), r.randint(0, 5), r.randint(6, 23), r.choice([0, 15, 30, 45])
    det, prov, rest = r.randint(2, 20), r.randint(5, 40), r.randint(10, 90)
    d, w, m = r.randint(5, 14), r.randint(2, 8), r.randint(3, 12)
    lag, tps = r.choice([2, 5, 10, 30]), r.choice([20, 50, 100, 400])
    return ask(r, [
        (f"Backups are taken every {every} hour(s). In the worst case, how many hours of data can be lost when the system fails?", every, [every / 2, every * 2, 0]),
        (f"A backup runs every day at {bh:02d}:00. The database fails at {fh:02d}:{fm:02d} the same day. How many minutes of data are lost?", (fh - bh) * 60 + fm, [(fh - bh) * 60, (24 - fh + bh) * 60 - fm, fh * 60 + fm]),
        (f"After a failure it takes {det} minutes to detect it, {prov} minutes to provision new servers and {rest} minutes to restore the data. What recovery time, in minutes, does this plan achieve?", det + prov + rest, [prov + rest, rest, max(det, prov, rest)]),
        (f"A policy keeps daily backups for {d} days, weekly backups for {w} weeks and monthly backups for {m} months. How many backups are stored once the policy is in full effect?", d + w + m, [d * w * m, d + w * 7 + m * 30, max(d, w, m)]),
        (f"A standby database is replicated asynchronously and is {lag} seconds behind. The primary handles {tps} transactions per second when it fails. About how many transactions are lost?", lag * tps, [tps, lag, lag * tps // 2]),
    ], "The recovery point objective (RPO) is about data: the worst-case loss is the time since the last backup or the replication lag. The recovery time objective (RTO) is about time: detection plus provisioning plus restore.")


@t(SC, REL, 2)
def _(r):
    p, a, w = pick(r, "Which disaster-recovery strategy is this?", [
        ("Only backups are kept in another region; the whole system is rebuilt from them after a disaster.", DR[0]),
        ("Data is replicated continuously and a minimal core of the system is kept idle, ready to be scaled up.", DR[1]),
        ("A scaled-down but fully working copy of the system runs all the time in another region.", DR[2]),
        ("Full-size copies run in two regions at once and both serve live traffic.", DR[3]),
    ])
    q = r.choice([("Which of these disaster-recovery strategies has the shortest recovery time?", DR[3]), ("Which of these disaster-recovery strategies is the cheapest to run day to day?", DR[0]),
                  ("Which of these disaster-recovery strategies has the longest recovery time?", DR[0]), ("Which of these disaster-recovery strategies costs the most to run?", DR[3])])
    if r.random() < 0.5:
        return Q(q[0], q[1], [x for x in DR if x != q[1]], "From backup and restore, through pilot light and warm standby, to multi-site, each strategy recovers faster and costs more to keep running.")
    return Q(p, a, w, "From backup and restore, through pilot light and warm standby, to multi-site, each strategy recovers faster and costs more to keep running.")


MON = "Monitoring and performance"


@t(SC, MON, 2)
def _(r):
    lat = sorted(uniq(r, r.choice([10, 20]), 20, 900))
    pct = r.choice([50, 90, 95, 99])
    idx = math.ceil(pct / 100 * len(lat)) - 1
    reqs, slo = r.choice([10_000, 50_000, 200_000, 1_000_000]), r.choice([99, 99.5, 99.9, 99.95])
    errs = int(reqs * r.choice([0.0005, 0.001, 0.0025, 0.005, 0.01, 0.02, 0.05]))
    budget = round(reqs * (100 - slo) / 100)
    day, conc, ms = r.choice([86_400, 432_000, 864_000, 4_320_000, 8_640_000]), r.choice([10, 20, 50, 200]), r.choice([50, 100, 200, 250, 500])
    cpu, thr = ints(r, 8, 40, 99), r.choice([70, 80])
    fire = next((i + 1 for i in range(2, 8) if sum(cpu[i - 2:i + 1]) / 3 > thr), None)
    form = r.randint(0, 6)
    why = "A percentile is the value below which that share of the measurements fall. An error budget is the number of failures the SLO still allows: requests × (1 - SLO). Throughput = concurrency ÷ time per request."
    if form == 0:
        ans = f"After reading {fire}" if fire else "It never fires"
        cands = [f"After reading {i}" for i in range(3, 9) if i != fire] + ["It never fires"]
        r.shuffle(cands)
        return Q(f"An alarm fires when the average of the last three CPU readings is above {thr}%. The readings are {seq(cpu)}%. When does it first fire?", ans, [c for c in cands if c != ans], why)
    return ask(r, [
        (f"Response times in ms, sorted: {seq(lat)}. Using the nearest-rank method, what is the {pct}th percentile?", lat[idx], [lat[-1] if lat[-1] != lat[idx] else lat[0], lat[len(lat) // 2 - 1] if lat[len(lat) // 2 - 1] != lat[idx] else lat[1], round(sum(lat) / len(lat))]),
        (f"Out of {reqs:,} requests, {errs} failed. What is the error rate, as a percentage (to two decimal places)?", round(errs / reqs * 100, 2), [round(errs / reqs, 2), round((reqs - errs) / reqs * 100, 2), round(errs / reqs * 1000, 2)]),
        (f"An SLO requires {slo}% of requests to succeed. Over {reqs:,} requests, how many failures does the error budget allow?", budget, [round(reqs * slo / 100), budget * 10, budget // 10 if budget >= 10 else budget + 7]),
        (f"An SLO allows {budget} failed requests this month and {min(errs, budget)} have already failed. How many more failures can happen before the SLO is broken?", budget - min(errs, budget), [budget, min(errs, budget), budget + min(errs, budget)]),
        (f"A service receives {day:,} requests in a day. What is its average rate in requests per second?", day / 86400, [day / 3600, day / 1440, day / 24]),
        (f"A server handles {conc} requests at a time and each takes {ms} ms. What is the most requests per second it can serve?", conc * 1000 / ms, [conc * ms / 1000, float(conc), 1000 / ms]),
    ], why)


if __name__ == "__main__":
    bank.write(OUT)
