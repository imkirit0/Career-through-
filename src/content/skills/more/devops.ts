import type { Question } from "../../taxonomy";

export const questions: Question[] = [
  // ---------- linux ----------
  {
    id: "linux-q9",
    skillId: "linux",
    topicId: "linux-filesystem",
    prompt:
      "/opt/app/current is a symbolic link that points to the directory /opt/app/releases/v1. You run `rm /opt/app/current`. What is removed?",
    options: [
      "The link and the whole v1 directory it points to",
      "The files inside v1, leaving an empty directory behind",
      "Only the link; the v1 directory and its files are untouched",
      "Nothing; rm refuses because the link points to a directory",
    ],
    answer: 2,
    explanation:
      "rm acts on the link itself, not on its target, so only the pointer disappears. That is why a `current` symlink can be removed or re-pointed without touching the release directories.",
  },
  {
    id: "linux-q10",
    skillId: "linux",
    topicId: "linux-filesystem",
    prompt: `app.log has exactly 100 lines. Which lines does this command print?\n\nhead -n 20 app.log | tail -n 5`,
    options: ["Lines 1 to 5", "Lines 16 to 20", "Lines 96 to 100", "Lines 20 to 25"],
    answer: 1,
    explanation:
      "head -n 20 passes on only the first 20 lines, and tail -n 5 keeps the last 5 of what it receives, which are lines 16 to 20 of the file.",
  },
  {
    id: "linux-q11",
    skillId: "linux",
    topicId: "linux-permissions",
    prompt:
      "`ls -l notes.txt` shows `-rw-r--r--`. You run `chmod g+w,o-r notes.txt`. What are the file's permissions afterwards?",
    options: ["-rw-rw---- (660)", "-rw-rw-r-- (664)", "-rw-r----- (640)", "-rw--w---- (620)"],
    answer: 0,
    explanation:
      "g+w adds write to the group's existing read (r-- becomes rw-), and o-r removes read from others (r-- becomes ---). The owner's rw- is not touched, giving rw-rw----.",
  },
  {
    id: "linux-q12",
    skillId: "linux",
    topicId: "linux-permissions",
    prompt: `\`ls -ld /srv/shared /srv/shared/todo.txt\` shows:\n\ndrwxr-xr-x 2 root root 4096 Mar 3 10:12 /srv/shared\n-rw-rw-rw- 1 root root  120 Mar 3 10:12 /srv/shared/todo.txt\n\nBob is an ordinary user who is not in the root group. What can he do with todo.txt?`,
    options: [
      "Change its contents and also delete it",
      "Delete it, but not change its contents",
      "Neither change its contents nor delete it",
      "Change its contents, but not delete it",
    ],
    answer: 3,
    explanation:
      "The file's rw- for others lets Bob edit its contents. Deleting a file changes the directory, and the directory gives others only r-x, with no write permission.",
  },
  {
    id: "linux-q13",
    skillId: "linux",
    topicId: "linux-processes",
    prompt:
      "You start `./backup.sh` in the foreground of a Bash session and press Ctrl+Z. What state is the process in now?",
    options: [
      "Terminated; it has to be started again from the beginning",
      "Suspended (stopped); `fg` or `bg` will resume it",
      "Still running, but moved to the background",
      "Still running in the foreground, as scripts ignore Ctrl+Z",
    ],
    answer: 1,
    explanation:
      "Ctrl+Z sends SIGTSTP, which pauses the job without ending it. `bg` lets it continue in the background and `fg` brings it back to the foreground; Ctrl+C is what interrupts it.",
  },
  {
    id: "linux-q14",
    skillId: "linux",
    topicId: "linux-processes",
    prompt:
      "The systemd unit for myapp contains `Restart=on-failure`. The service is running when its main process crashes and exits with status 1. What does systemd do?",
    options: [
      "Leaves the service failed until someone runs `systemctl start myapp`",
      "Reboots the server so that every service starts cleanly",
      "Disables the unit so that it no longer starts at boot",
      "Starts the service again by itself, since a non-zero exit is a failure",
    ],
    answer: 3,
    explanation:
      "Restart=on-failure tells systemd to restart the service whenever it ends uncleanly, such as with a non-zero exit status or a crash signal. A clean exit or `systemctl stop` does not trigger a restart.",
  },
  {
    id: "linux-q15",
    skillId: "linux",
    topicId: "linux-scripting",
    prompt: `What does this Bash script print?\n\nname="World"\necho 'Hello $name'`,
    options: ["Hello $name", "Hello World", "Hello", "Hello 'World'"],
    answer: 0,
    explanation:
      "Single quotes keep every character literal, so $name is not expanded. Double quotes (\"Hello $name\") would expand the variable and print Hello World.",
  },
  {
    id: "linux-q16",
    skillId: "linux",
    topicId: "linux-scripting",
    prompt: `names.txt contains these five lines:\n\nbob\nalice\nbob\ncarol\nalice\n\nWhat does \`uniq names.txt | wc -l\` print, and why?`,
    options: [
      "3, because uniq removes every repeated line in the file",
      "2, because uniq keeps only the names that are repeated",
      "5, because uniq only removes repeats that are next to each other",
      "1, because uniq merges all of its input into a single line",
    ],
    answer: 2,
    explanation:
      "uniq only collapses identical lines that are adjacent, and no two neighbouring lines here are the same, so all five pass through. Sorting first (`sort names.txt | uniq`) would give 3.",
  },

  // ---------- ci-cd ----------
  {
    id: "ci-cd-q9",
    skillId: "ci-cd",
    topicId: "ci-cd-concepts",
    prompt:
      "A team runs its full test suite only once, the night before each monthly release, and usually finds dozens of failures that take days to trace. What is the main benefit of running the tests automatically on every commit instead?",
    options: [
      "The test suite itself runs faster when a CI server starts it",
      "Every commit goes straight to production without a release step",
      "Developers can stop running any tests on their own machines",
      "Each failure points to one small, recent change that is quick to find",
    ],
    answer: 3,
    explanation:
      "Testing every commit gives fast feedback: when a run goes red, the cause is in the handful of lines just changed rather than somewhere in a month of work.",
  },
  {
    id: "ci-cd-q10",
    skillId: "ci-cd",
    topicId: "ci-cd-concepts",
    prompt:
      "A pipeline is configured by clicking through the CI tool's web interface. Someone edits a step, builds start failing, and nobody can tell what changed or when. Which practice addresses this most directly?",
    options: [
      "Keep the pipeline definition in the repository, reviewed and versioned like code",
      "Pin every dependency version in a lockfile, so that each build installs the same packages",
      "Turn on notifications for failed builds, so that the team hears about a broken step sooner",
      "Allow only one administrator to edit the pipeline in the web interface",
    ],
    answer: 0,
    explanation:
      "With the pipeline defined in a versioned file, every change goes through review and shows up in the history, so you can see exactly what changed and revert it.",
  },
  {
    id: "ci-cd-q11",
    skillId: "ci-cd",
    topicId: "ci-cd-pipeline-config",
    prompt:
      "A GitHub Actions workflow defines three jobs: lint, test and build. None of them has a `needs:` key. How do the jobs run when the workflow is triggered?",
    options: [
      "One after another, in the order they are written in the file",
      "One after another, in alphabetical order of the job names",
      "In parallel, each on its own runner, with no fixed order",
      "Only the first job runs; the others must be started by hand",
    ],
    answer: 2,
    explanation:
      "Jobs in a workflow are independent and run in parallel by default. An order only exists where a job declares `needs:` on another job.",
  },
  {
    id: "ci-cd-q12",
    skillId: "ci-cd",
    topicId: "ci-cd-pipeline-config",
    prompt: `A GitHub Actions workflow contains:\n\non: push\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test\n  deploy:\n    needs: test\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: ./deploy.sh\n\nA developer pushes a commit to the branch feature/login and the test job passes. What happens next?`,
    options: [
      "deploy runs, because the job it needs has passed",
      "deploy is skipped, because the pushed ref is not main",
      "deploy fails with an error, which marks the whole run as failed",
      "deploy waits in a queue until the branch is merged into main",
    ],
    answer: 1,
    explanation:
      "The push trigger has no branch filter, so the workflow runs for every branch, but the `if:` condition on deploy is false for refs/heads/feature/login. A job whose condition is false is skipped, not failed.",
  },
  {
    id: "ci-cd-q13",
    skillId: "ci-cd",
    topicId: "ci-cd-testing-artifacts",
    prompt:
      "A pipeline compiles the application from source once for staging and then compiles it again for production. A bug appears in production that never appeared in staging, even though both builds came from the same commit. Which practice removes this class of problem?",
    options: [
      "Build one artifact and promote that same artifact to each environment",
      "Compile a third time in production and compare the two results",
      "Clear the dependency cache before each of the two builds, so both start clean",
      "Skip staging so that there is only one build to worry about",
    ],
    answer: 0,
    explanation:
      "Two builds of the same commit can still differ, for example in the dependency versions resolved at build time. Building once and promoting the same artifact means production runs exactly what was tested.",
  },
  {
    id: "ci-cd-q14",
    skillId: "ci-cd",
    topicId: "ci-cd-testing-artifacts",
    prompt:
      "A pipeline runs three independent checks one after another: lint (2 min), unit tests (6 min) and integration tests (10 min). You change them to run as three parallel jobs, with enough runners for all three. Ignoring start-up overhead, about how long does a developer now wait for the complete result?",
    options: ["18 minutes", "10 minutes", "6 minutes", "2 minutes"],
    answer: 1,
    explanation:
      "Parallel jobs all start together, so the wait is set by the slowest one: 10 minutes instead of the 2 + 6 + 10 = 18 minutes of the sequential run.",
  },
  {
    id: "ci-cd-q15",
    skillId: "ci-cd",
    topicId: "ci-cd-deployment",
    prompt:
      "A team uses blue-green deployment. Blue runs v1 and takes all traffic. v2 is deployed to green and the router is switched so that green takes all traffic; blue is left running. Five minutes later a serious bug is found in v2. What is the fastest way to recover?",
    options: [
      "Fix the bug and push v3 through the whole pipeline",
      "Rebuild v1 from source and deploy it over green",
      "Restart the green servers so that they reload v2",
      "Switch the router back to blue, which still runs v1",
    ],
    answer: 3,
    explanation:
      "The point of keeping the old environment running is that rollback is just a traffic switch back to it, with no rebuild or redeploy needed.",
  },
  {
    id: "ci-cd-q16",
    skillId: "ci-cd",
    topicId: "ci-cd-deployment",
    prompt:
      "An application runs on 10 identical servers behind a load balancer. A rolling deployment takes 2 servers out of rotation at a time, updates them, and returns them before moving on to the next 2. What is the lowest share of normal serving capacity during the deployment?",
    options: ["20%", "50%", "80%", "100%"],
    answer: 2,
    explanation:
      "At any moment at most 2 of the 10 servers are out of rotation, so 8 of 10 (80%) keep serving. The batch size is how you trade deployment speed against spare capacity.",
  },

  // ---------- docker ----------
  {
    id: "docker-q9",
    skillId: "docker",
    topicId: "docker-images",
    prompt:
      "You open a shell in a running container with `docker exec` and install curl with the package manager. You then start a second container from the same image. Is curl available in the second container?",
    options: [
      "Yes, because installing a package in a container updates the image",
      "Yes, because containers from one image share a filesystem",
      "No, because the change is only in the first container's writable layer",
      "No, because packages cannot be installed in a running container",
    ],
    answer: 2,
    explanation:
      "An image is read-only; each container adds its own writable layer on top. To have curl in every container, install it in the Dockerfile and rebuild the image.",
  },
  {
    id: "docker-q10",
    skillId: "docker",
    topicId: "docker-images",
    prompt: `A Dockerfile has two stages:\n\nFROM node:20 AS build\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\n\nWhat does the final image contain?`,
    options: [
      "nginx:alpine plus the dist files, without Node.js or node_modules",
      "Everything from both stages, including Node.js and node_modules",
      "Only the dist files, with no base image underneath them",
      "node:20 plus the dist files; nginx is used only at build time",
    ],
    answer: 0,
    explanation:
      "The final image is built from the last FROM onwards, and only what COPY --from explicitly brings across comes from the earlier stage. That is how multi-stage builds keep build tools out of the shipped image.",
  },
  {
    id: "docker-q11",
    skillId: "docker",
    topicId: "docker-containers",
    prompt:
      "`docker run -d nginx` keeps running, but `docker run -d ubuntu` exits within a second. Both images are fine. Why does the ubuntu container stop?",
    options: [
      "Detached mode only works for images that contain a server",
      "Docker stops any container that has not published a port",
      "Base OS images cannot be run directly; they are only for use in FROM lines",
      "Its main process, a shell with no input, exits, which ends the container",
    ],
    answer: 3,
    explanation:
      "A container lives only as long as its main process. nginx stays in the foreground serving requests, while the ubuntu image's default command is a shell that exits immediately when it has no terminal or input.",
  },
  {
    id: "docker-q12",
    skillId: "docker",
    topicId: "docker-containers",
    prompt:
      "A container started with `docker run -d --memory 256m api` keeps dying. `docker ps -a` shows `Exited (137)` and `docker inspect` shows `\"OOMKilled\": true`. What happened?",
    options: [
      "The image was built for a different CPU architecture than the host uses",
      "The process went over the 256 MB memory limit and the kernel killed it",
      "The host ran out of disk space for the container's writable layer",
      "The application finished its work and exited normally",
    ],
    answer: 1,
    explanation:
      "Exit code 137 is 128 + 9, meaning the process was ended by SIGKILL, and OOMKilled confirms the kernel killed it for exceeding the container's memory limit. The fix is to reduce memory use or raise the limit.",
  },
  {
    id: "docker-q13",
    skillId: "docker",
    topicId: "docker-networking-volumes",
    prompt:
      "A container is running with `-p 8080:80`. You start a second container from the same image, also with `-p 8080:80`. What happens?",
    options: [
      "Both run, and Docker balances requests on port 8080 between them",
      "The second fails to start, because host port 8080 is already in use",
      "The second fails to start, because two containers cannot both listen on port 80",
      "The second takes over port 8080 and the first container is stopped",
    ],
    answer: 1,
    explanation:
      "Each container has its own network namespace, so both can listen on port 80 internally, but a host port can be bound only once. The second container needs a different host port, such as -p 8081:80.",
  },
  {
    id: "docker-q14",
    skillId: "docker",
    topicId: "docker-networking-volumes",
    prompt: `An image contains default config files in /app/config. You run it with a bind mount of an empty host directory:\n\ndocker run -v /srv/empty:/app/config myimg\n\nWhat does the container see in /app/config?`,
    options: [
      "The image's default files, because image contents take priority over a mount",
      "The image's default files, which Docker also copies into /srv/empty",
      "An empty directory, because the bind mount hides what the image had at that path",
      "Nothing; the container refuses to start because the path already exists in the image",
    ],
    answer: 2,
    explanation:
      "A bind mount places the host directory over the container path, so whatever the image had there is hidden for that container. Only a new, empty named volume is pre-filled from the image; a bind mount is not.",
  },
  {
    id: "docker-q15",
    skillId: "docker",
    topicId: "docker-compose",
    prompt: `A compose file contains:\n\nservices:\n  web:\n    build: .\n    ports:\n      - "8000:8000"\n  db:\n    image: postgres:16\n    ports:\n      - "5433:5432"\n\nBoth services are up. From a terminal on the host machine (not inside a container), which address reaches this database?`,
    options: ["localhost:5433", "localhost:5432", "db:5432", "db:5433"],
    answer: 0,
    explanation:
      "Port mappings are HOST:CONTAINER, so the host reaches the database on its published port 5433. The name db and port 5432 are what other services use inside the Compose network; the host does not resolve service names.",
  },
  {
    id: "docker-q16",
    skillId: "docker",
    topicId: "docker-compose",
    prompt:
      "A Compose project has three running services: web, worker and db. No service depends on worker. You change only the image tag of worker in the compose file and run `docker compose up -d`. What does Compose do?",
    options: [
      "Nothing, because the containers are already running",
      "Stops and recreates all three containers from scratch",
      "Reports an error until you run `docker compose down` first",
      "Recreates only the worker container; web and db are left running",
    ],
    answer: 3,
    explanation:
      "compose up compares each running container with the current configuration and recreates only the services whose configuration or image has changed, leaving the others untouched.",
  },

  // ---------- cloud-fundamentals ----------
  {
    id: "cloud-fundamentals-q9",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-models",
    prompt:
      "A startup does its bookkeeping in a SaaS accounting product that its staff use through the browser. A security flaw is found in the product's server-side code. Under the shared responsibility model, who has to fix it?",
    options: [
      "The startup, because the customer is always responsible for the application layer",
      "The SaaS vendor, because on SaaS the provider runs and maintains the application",
      "Both: the vendor releases a patch and the startup installs it on its own servers",
      "Nobody; a flaw in SaaS code is a risk that the customer accepts by signing up",
    ],
    answer: 1,
    explanation:
      "With SaaS the provider runs the whole stack, including the application itself, so patching its code is the vendor's job and there is nothing for the customer to install. The customer's side shrinks to how it uses the product: its data, its user accounts and who is allowed to access what.",
  },
  {
    id: "cloud-fundamentals-q10",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-models",
    prompt:
      "A team deploys its web application to a PaaS. Attackers steal data through a SQL injection bug in the team's own application code. Under the shared responsibility model, who was responsible for preventing this?",
    options: [
      "The provider, because a PaaS manages the whole application stack",
      "The provider, because it patches the operating system and runtime",
      "Nobody; injection attacks fall outside the shared responsibility model",
      "The team, because the application code is the customer's on a PaaS",
    ],
    answer: 3,
    explanation:
      "On a PaaS the provider looks after servers, the OS and the runtime, but the code you deploy and the data it handles remain your responsibility in every service model.",
  },
  {
    id: "cloud-fundamentals-q11",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-compute-storage",
    prompt:
      "A company must keep 20 TB of audit logs for seven years for compliance. The logs are almost never read, and waiting a few hours to retrieve one is acceptable. Which storage choice keeps the cost lowest?",
    options: [
      "An archive (cold) tier of object storage",
      "High-performance SSD block volumes",
      "The standard (hot) tier of object storage",
      "A managed relational database",
    ],
    answer: 0,
    explanation:
      "Archive tiers charge the least per GB stored in exchange for slow, more expensive retrieval, which suits data that is kept for years and rarely read. Hot tiers and SSD volumes charge for fast access the logs do not need.",
  },
  {
    id: "cloud-fundamentals-q12",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-compute-storage",
    prompt:
      "Tonight you will run a risky upgrade on a database whose data lives on a persistent block storage volume. You want a point-in-time copy of the disk that you can restore if the upgrade goes wrong. What do you create first?",
    options: [
      "A RAID 1 mirror of the volume",
      "A read replica of the database",
      "A snapshot of the data volume",
      "A standby VM in another zone",
    ],
    answer: 2,
    explanation:
      "A snapshot captures the volume's contents at a moment in time and can be restored to a new volume later. A mirror or a replica copies every change as it happens, including a bad upgrade, so neither keeps the data as it was before; a standby VM holds no copy of the data at all.",
  },
  {
    id: "cloud-fundamentals-q13",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-iam",
    prompt:
      "Twelve developers need the same set of cloud permissions, and new developers join every month. What is the most maintainable way to manage their access?",
    options: [
      "Attach the same policies to each user, one user at a time",
      "Have all twelve share a single user account and password",
      "Give every developer full administrator access to avoid gaps",
      "Attach the policies to a group and add each developer to it",
    ],
    answer: 3,
    explanation:
      "Permissions attached to a group apply to all its members, so access is defined once and a joiner or leaver is a single membership change. Individual identities are kept, so actions stay traceable to a person.",
  },
  {
    id: "cloud-fundamentals-q14",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-iam",
    prompt: `An AWS IAM user has only this policy statement attached, and no other policy applies:\n\n{\n  "Effect": "Allow",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::reports/*"\n}\n\nThe user tries to download reports/q1.pdf and then to upload reports/q2.pdf. What happens?`,
    options: [
      "The download succeeds; the upload is denied",
      "Both succeed, because the policy covers every object in the bucket",
      "Both are denied, because a user needs s3:* to use a bucket at all",
      "The upload succeeds; the download is denied",
    ],
    answer: 0,
    explanation:
      "Anything not explicitly allowed is denied by default. The policy allows only s3:GetObject (reading objects); uploading needs s3:PutObject, which nothing grants.",
  },
  {
    id: "cloud-fundamentals-q15",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-scaling-cost",
    prompt:
      "An autoscaling group is set to keep average CPU at about 60%. It has 4 instances which, under a steady load, average 90% CPU. Assuming CPU use is proportional to load and the load is spread evenly, how many instances will it settle on?",
    options: ["5", "6", "8", "9"],
    answer: 1,
    explanation:
      "The total work is 4 x 90 = 360 CPU-percent. Spread over instances that should each sit at 60%, that needs 360 / 60 = 6 instances.",
  },
  {
    id: "cloud-fundamentals-q16",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-scaling-cost",
    prompt:
      "At peak, a web application needs 6 instances to handle its traffic. Instances are spread evenly across 3 availability zones, and the application must still handle peak traffic if any one zone fails. What is the minimum total number of instances to run?",
    options: ["6", "8", "9", "12"],
    answer: 2,
    explanation:
      "Losing one of three zones removes a third of the fleet, so the remaining two thirds must equal 6: that is 9 instances, 3 per zone. With only 6, a zone failure would leave 4.",
  },

  // ---------- networking ----------
  {
    id: "networking-q9",
    skillId: "networking",
    topicId: "networking-ip-ports",
    prompt:
      "A server has one IP address and runs both a web server and an SSH server. When a TCP packet arrives, how does the operating system know which of the two programs should receive it?",
    options: [
      "By the destination port number in the packet",
      "By the source IP address of the sender",
      "By the MAC address of the network card",
      "By the hostname the sender looked up in DNS",
    ],
    answer: 0,
    explanation:
      "The IP address identifies the machine and the port identifies the service on it. Each program listens on its own port, and the OS hands the packet to whichever one is bound to the destination port.",
  },
  {
    id: "networking-q10",
    skillId: "networking",
    topicId: "networking-ip-ports",
    prompt:
      "A server has the address 192.168.10.70 with a /26 mask. Which of these addresses is in the same subnet?",
    options: ["192.168.10.30", "192.168.10.60", "192.168.10.100", "192.168.10.130"],
    answer: 2,
    explanation:
      "A /26 leaves 6 host bits, so subnets are blocks of 64 addresses: .0-.63, .64-.127, .128-.191 and .192-.255. Both .70 and .100 fall in the .64-.127 block.",
  },
  {
    id: "networking-q11",
    skillId: "networking",
    topicId: "networking-dns",
    prompt:
      "Your laptop needs the IP address of www.example.com and has nothing cached. Which server does the laptop itself send the DNS query to?",
    options: [
      "A root name server, which knows every domain",
      "The authoritative name server for example.com",
      "The name server for the .com top-level domain",
      "The recursive resolver set in its network settings",
    ],
    answer: 3,
    explanation:
      "A device only talks to its configured recursive resolver (for example one provided by the router or ISP). That resolver does the walk from root to TLD to authoritative server on the device's behalf and returns the answer.",
  },
  {
    id: "networking-q12",
    skillId: "networking",
    topicId: "networking-dns",
    prompt:
      "An A record has a TTL of 300 seconds. A recursive resolver that honours TTLs caches the record at 09:58. At 10:00 you change the record to a new IP address. What is the latest time at which that resolver can still return the old address?",
    options: ["10:00", "10:03", "10:05", "10:58"],
    answer: 1,
    explanation:
      "The TTL counts from the moment the resolver cached the answer, not from when the record was changed: 09:58 plus 300 seconds (5 minutes) is 10:03.",
  },
  {
    id: "networking-q13",
    skillId: "networking",
    topicId: "networking-http-tls",
    prompt: `You run \`curl -I http://shop.example.com\` and the response begins:\n\nHTTP/1.1 301 Moved Permanently\nLocation: https://shop.example.com/\n\nWhat is the server telling the client?`,
    options: [
      "The page could not be found at any URL on this server",
      "The request succeeded and the page content follows in the response body",
      "The client must log in at the Location URL before it can see the page",
      "The page now lives at the HTTPS URL, so request that instead",
    ],
    answer: 3,
    explanation:
      "3xx codes are redirects: 301 says the resource has permanently moved to the URL in the Location header. Here the server is sending plain-HTTP visitors to the HTTPS version of the site.",
  },
  {
    id: "networking-q14",
    skillId: "networking",
    topicId: "networking-http-tls",
    prompt:
      "On public Wi-Fi, a user loads https://bank.example.com/account?id=42 and the TLS connection is set up correctly. What can someone capturing the Wi-Fi traffic learn?",
    options: [
      "The full URL and the page content, since public Wi-Fi is a shared, open medium",
      "The URL path and query string, but not the page content",
      "Which server the laptop is talking to, but not the path, query or content",
      "Nothing at all, not even which server the laptop is connecting to",
    ],
    answer: 2,
    explanation:
      "TLS encrypts the whole HTTP exchange, including the path, query string, headers and body. The packets still have to be addressed to the server's IP, so an observer can see which server is being contacted.",
  },
  {
    id: "networking-q15",
    skillId: "networking",
    topicId: "networking-load-balancing-troubleshooting",
    prompt:
      "One public address must send requests for /api/* to a pool of API servers and requests for /images/* to a pool of image servers. Which kind of load balancer can make that decision?",
    options: [
      "A layer 7 (HTTP) load balancer, because it can read the URL path",
      "A layer 4 (TCP) load balancer, because it can read the destination port",
      "Either kind, because both of them inspect the full HTTP request",
      "Neither; routing by path can only be done with separate DNS names",
    ],
    answer: 0,
    explanation:
      "A layer 4 load balancer sees only IP addresses and ports, and both kinds of request arrive on the same port. A layer 7 load balancer understands HTTP, so it can route on the path, host or headers.",
  },
  {
    id: "networking-q16",
    skillId: "networking",
    topicId: "networking-load-balancing-troubleshooting",
    prompt:
      "Users report errors from https://api.example.com. From your machine, `dig api.example.com` returns the expected IP, `nc -zv api.example.com 443` reports that the connection succeeded, and `curl https://api.example.com/health` returns `503 Service Unavailable`. Where is the problem most likely to be?",
    options: [
      "In DNS, because the name is resolving to the wrong address",
      "In the application or its backends, as the name and port both work",
      "In a network firewall that is silently dropping the traffic to port 443",
      "In the TLS certificate, because the server returned an error",
    ],
    answer: 1,
    explanation:
      "Working through the layers, name resolution, the TCP port and the TLS handshake all succeeded, because an HTTP response came back. A 503 is the server side saying it cannot serve the request, so the next step is the application and its logs.",
  },

  // ---------- iac ----------
  {
    id: "iac-q9",
    skillId: "iac",
    topicId: "iac-concepts",
    prompt:
      "Which statement best describes the declarative approach used by infrastructure-as-code tools such as Terraform?",
    options: [
      "You write the exact commands to run, in order, to build the infrastructure",
      "You describe the end state you want, and the tool works out the steps to reach it",
      "You record your clicks in the cloud console, and the tool replays them later",
      "You list the resources that exist today, and the tool keeps a backup copy of them",
    ],
    answer: 1,
    explanation:
      "Declarative code states what should exist; the tool compares that with what does exist and decides what to create, change or delete. Writing the steps yourself is the imperative approach.",
  },
  {
    id: "iac-q10",
    skillId: "iac",
    topicId: "iac-concepts",
    prompt:
      "A Terraform configuration sets `count = 3` on a server resource, and those three servers already exist and match the configuration. You change the value to `count = 5` and run `terraform apply`. What does Terraform do?",
    options: [
      "Creates five more servers, for a total of eight",
      "Destroys the three servers and creates five new ones",
      "Fails, because count cannot be changed after the first apply",
      "Creates two more servers, for a total of five",
    ],
    answer: 3,
    explanation:
      "Terraform works out the difference between the desired state (five) and the current state (three) and makes only that change: two new servers. The existing three are left alone.",
  },
  {
    id: "iac-q11",
    skillId: "iac",
    topicId: "iac-workflow",
    prompt:
      "A Terraform configuration defines a subnet and a VM. The VM block appears first in the file and sets its subnet with `subnet_id = aws_subnet.main.id`. In what order does `terraform apply` create them?",
    options: [
      "The VM first, because resources are created in file order",
      "Both at the same time; the VM fails and is retried on the next apply",
      "The subnet first, because the reference makes the VM depend on it",
      "In alphabetical order of the resource names",
    ],
    answer: 2,
    explanation:
      "Terraform builds a dependency graph from the references between resources, so the subnet is created before the VM that uses its ID. The order of blocks in the file does not matter.",
  },
  {
    id: "iac-q12",
    skillId: "iac",
    topicId: "iac-workflow",
    prompt:
      "A Terraform configuration manages three resources, A, B and C, which all exist and match the code. In one commit you add a new resource D, change a tag on B that can be updated in place, and delete the block for C. What summary does `terraform plan` print?",
    options: [
      "Plan: 1 to add, 1 to change, 1 to destroy",
      "Plan: 1 to add, 1 to change, 0 to destroy",
      "Plan: 2 to add, 0 to change, 2 to destroy",
      "Plan: 4 to add, 0 to change, 3 to destroy",
    ],
    answer: 0,
    explanation:
      "D is new (add), B is updated in place (change), and C is in state but no longer in the code (destroy). A is unchanged, so it does not appear in the summary.",
  },
  {
    id: "iac-q13",
    skillId: "iac",
    topicId: "iac-state",
    prompt:
      "A storage bucket was created by hand in the cloud console and holds important data. The team now wants Terraform to manage it without recreating it. What is the correct approach?",
    options: [
      "Write a resource block and run a normal `terraform apply`, which adopts any existing resource",
      "Delete the bucket and let Terraform create a fresh one from the code",
      "Open the state file in an editor and type in the bucket's name",
      "Write a matching resource block and import the bucket into state, e.g. with `terraform import`",
    ],
    answer: 3,
    explanation:
      "Terraform only manages what is recorded in its state. Importing links the existing bucket to a resource block, after which plan should show no changes; a plain apply would instead try to create a second bucket and fail on the name.",
  },
  {
    id: "iac-q14",
    skillId: "iac",
    topicId: "iac-state",
    prompt:
      "A server is managed by a block named `aws_instance.web`. You rename the block to `aws_instance.frontend`, change nothing else, add no `moved` block, and run `terraform plan`. What does the plan show?",
    options: [
      "No changes, because the real server is the same",
      "Destroy aws_instance.web and create aws_instance.frontend",
      "An in-place update that renames the server",
      "An error, because resource names cannot be changed",
    ],
    answer: 1,
    explanation:
      "State maps each resource address to a real resource. After the rename, the old address is in state but not in the code (destroy) and the new address is in the code but not in state (create). A `moved` block or `terraform state mv` tells Terraform it is the same resource.",
  },
  {
    id: "iac-q15",
    skillId: "iac",
    topicId: "iac-modules-variables",
    prompt: `A Terraform variable \`instance_type\` has the default "t3.micro". The file terraform.tfvars sets it to "t3.small". You run:\n\nterraform apply -var="instance_type=t3.large"\n\nWhich value does Terraform use?`,
    options: [
      "t3.large, because -var on the command line overrides the others",
      "t3.small, because terraform.tfvars is always loaded last",
      "t3.micro, because the default in the code takes priority",
      "None; Terraform stops with an error about conflicting values",
    ],
    answer: 0,
    explanation:
      "A default is used only when nothing else sets the variable. terraform.tfvars overrides the default, and -var on the command line has the highest precedence of all.",
  },
  {
    id: "iac-q16",
    skillId: "iac",
    topicId: "iac-modules-variables",
    prompt: `A module in ./modules/web creates as many servers as its \`instance_count\` input says. The root configuration contains:\n\nmodule "web_dev" {\n  source         = "./modules/web"\n  instance_count = 1\n}\n\nmodule "web_prod" {\n  source         = "./modules/web"\n  instance_count = 3\n}\n\nStarting from nothing, how many servers exist after \`terraform apply\`?`,
    options: ["1", "3", "4", "6"],
    answer: 2,
    explanation:
      "Each module block is a separate instance of the module with its own inputs and its own resources, so the two calls create 1 + 3 = 4 servers.",
  },

  // ---------- monitoring ----------
  {
    id: "monitoring-q9",
    skillId: "monitoring",
    topicId: "monitoring-signals",
    prompt:
      "An application's log level is set to WARN in production. The levels, from least to most severe, are DEBUG, INFO, WARN and ERROR. Which messages are written to the log?",
    options: [
      "Only WARN messages",
      "DEBUG, INFO and WARN messages",
      "WARN and ERROR messages",
      "Messages at all four levels",
    ],
    answer: 2,
    explanation:
      "A log level is a minimum severity: messages at that level and above are written, and anything less severe (here DEBUG and INFO) is dropped.",
  },
  {
    id: "monitoring-q10",
    skillId: "monitoring",
    topicId: "monitoring-signals",
    prompt:
      "A developer adds `user_id` as a label on a request-count metric for a service with two million users. What is the main problem with this?",
    options: [
      "Each user becomes its own time series, which overloads the metrics system",
      "Metric labels may only contain numbers, so the whole metric is rejected",
      "The request count becomes two million times larger than the real value",
      "Labels are not stored, so the user_id is silently thrown away",
    ],
    answer: 0,
    explanation:
      "Each distinct combination of label values is stored as its own time series, so an unbounded label like user_id explodes cardinality. Per-user detail belongs in logs or traces; metric labels should have a small, fixed set of values.",
  },
  {
    id: "monitoring-q11",
    skillId: "monitoring",
    topicId: "monitoring-metrics-dashboards",
    prompt:
      "The counter `http_requests_total` reads 12,000 at 10:00:00 and 12,600 at 10:01:00, with no restart in between. What was the average request rate over that minute?",
    options: [
      "600 requests per second",
      "10 requests per second",
      "210 requests per second",
      "12,600 requests per second",
    ],
    answer: 1,
    explanation:
      "A counter only ever goes up, so traffic is read from how fast it increases: (12,600 - 12,000) / 60 seconds = 10 requests per second.",
  },
  {
    id: "monitoring-q12",
    skillId: "monitoring",
    topicId: "monitoring-metrics-dashboards",
    prompt:
      "Ten requests are measured: nine take 100 ms each and one takes 4,100 ms. What are the average (mean) and the median latency?",
    options: [
      "Average 100 ms, median 500 ms",
      "Average 500 ms, median 500 ms",
      "Average 2,100 ms, median 100 ms",
      "Average 500 ms, median 100 ms",
    ],
    answer: 3,
    explanation:
      "The mean is (9 x 100 + 4,100) / 10 = 500 ms, while the median, the middle value, is 100 ms. One slow request pulls the average far from what a typical user experienced.",
  },
  {
    id: "monitoring-q13",
    skillId: "monitoring",
    topicId: "monitoring-alerting",
    prompt:
      "A team reports: \"Over the last 30 days, 99.95% of requests succeeded. Our target is 99.9%.\" Which term matches each number?",
    options: [
      "99.95% is the SLI (what was measured); 99.9% is the SLO (the target)",
      "99.95% is the SLO (the target); 99.9% is the SLI (what was measured)",
      "99.95% is the error budget; 99.9% is the SLI (what was measured)",
      "99.95% is the SLO (the target); 99.9% is the error budget",
    ],
    answer: 0,
    explanation:
      "A service level indicator is the measurement of how the service actually behaved; a service level objective is the target set for that indicator. The error budget is the gap the target allows, here 0.1% of requests.",
  },
  {
    id: "monitoring-q14",
    skillId: "monitoring",
    topicId: "monitoring-alerting",
    prompt:
      "A service has an SLO of 99.9% successful requests and receives 1,000,000 requests in the SLO window. An incident causes 400 failed requests, and there are no other failures. How much of the error budget is left?",
    options: ["40%", "60%", "96%", "99.96%"],
    answer: 1,
    explanation:
      "The budget is the 0.1% of requests allowed to fail: 1,000 requests. The incident used 400 of them, leaving 600, which is 60% of the budget.",
  },
  {
    id: "monitoring-q15",
    skillId: "monitoring",
    topicId: "monitoring-incidents",
    prompt:
      "A service runs six instances behind a load balancer, all on the same version, deployed three days ago. The error-rate graph split by instance shows five at 0.1% and one at 40%. What is the best first mitigation?",
    options: [
      "Roll back the three-day-old deploy on all six instances",
      "Double the size of all six instances to add headroom",
      "Leave it alone until the next scheduled deploy replaces it",
      "Take the one bad instance out of rotation, then investigate it",
    ],
    answer: 3,
    explanation:
      "The fault is isolated to one instance while the same version is healthy on the other five, so removing that instance from the load balancer stops the user impact at once. The cause can then be investigated without pressure.",
  },
  {
    id: "monitoring-q16",
    skillId: "monitoring",
    topicId: "monitoring-incidents",
    prompt:
      "At 14:02 three services (checkout, search and profile) all start returning errors, and users confirm the failures. The services are owned by different teams and none of them was deployed today. What is the most productive first hypothesis?",
    options: [
      "Three unrelated bugs happened to surface in the same minute",
      "The monitoring system is wrong and nothing is really failing",
      "Something they share, such as a database or auth service, is failing",
      "Each service has independently reached its own traffic limit at the same moment",
    ],
    answer: 2,
    explanation:
      "Simultaneous failures in otherwise independent services point to a common cause. Checking what they all depend on is far more likely to find the fault than debugging each service separately.",
  },
];
