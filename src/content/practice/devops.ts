import type { Question } from "../taxonomy";

export const questions: Question[] = [
  // ───────── linux ─────────
  {
    id: "linux-p1",
    skillId: "linux",
    topicId: "linux-filesystem",
    prompt:
      "Your shell's current directory is /var/log/nginx. You run `cd ../../lib`. Which directory are you in now?",
    options: ["/var/log/lib", "/lib", "/var/lib", "/var/log/nginx/lib"],
    answer: 2,
    explanation:
      "Each `..` moves up one level: from /var/log/nginx to /var/log, then to /var, and `lib` is entered from there. The path does not start with a slash, so it is relative to where you are and cannot land in /lib at the top of the filesystem.",
  },
  {
    id: "linux-p2",
    skillId: "linux",
    topicId: "linux-filesystem",
    prompt:
      "A teammate says the project directory contains a `.env` file, but a plain `ls` does not list it. The file really is there. Why is it missing from the output?",
    options: [
      "Names starting with a dot are hidden unless you use `ls -a`",
      "The file is owned by another user, so `ls` leaves it out of the listing",
      "The file is empty, and `ls` skips empty files",
      "`ls` only lists directories unless you add `-l`",
    ],
    answer: 0,
    explanation:
      "By convention, files whose names begin with a dot are hidden from a plain `ls`, and `-a` includes them. Ownership does not hide a file from a listing: you can see the names in a directory you can read even when you cannot open the files themselves.",
  },
  {
    id: "linux-p3",
    skillId: "linux",
    topicId: "linux-permissions",
    prompt:
      "`ls -ld reports` shows:\n\ndrwxr-x--- 2 alice devs 4096 Mar 3 10:12 reports\n\nBob is not alice, but he is a member of the group devs. What can Bob do with this directory?",
    options: [
      "Nothing at all, because only the owner has access",
      "List its contents and enter it, but not create or delete files",
      "List, enter, create and delete files, exactly the same as alice can",
      "Create files in it, but not list what is already there",
    ],
    answer: 1,
    explanation:
      "The middle three characters, `r-x`, apply to the group: read lets Bob list the directory and execute lets him enter it, but with no write bit he cannot add or remove entries. Full access belongs only to the owner's `rwx`, and the final `---` shuts out everyone who is neither alice nor in devs.",
  },
  {
    id: "linux-p4",
    skillId: "linux",
    topicId: "linux-permissions",
    prompt:
      "A web application runs as the user www-data. It fails to save uploads into /var/www/uploads, which `ls -ld` shows as `drwxr-xr-x root root`. What is the most appropriate fix?",
    options: [
      "Run `chmod 777 /var/www/uploads` so any user can write there",
      "Reconfigure the web application to run as root",
      "Point the application at /tmp instead, since everyone can write there",
      "Run `chown www-data /var/www/uploads` so the service user owns it",
    ],
    answer: 3,
    explanation:
      "Only the owner has write permission on this directory, so making www-data the owner gives exactly the access the app needs. `chmod 777` also makes the error go away, but it lets every account on the server write there, which is far more access than the problem requires.",
  },
  {
    id: "linux-p5",
    skillId: "linux",
    topicId: "linux-processes",
    prompt:
      "A server suddenly feels slow and you want a live, continuously updating view of which processes are using the most CPU and memory. Which command do you run?",
    options: ["ps aux", "df -h", "uptime", "top"],
    answer: 3,
    explanation:
      "top refreshes every few seconds and sorts processes by CPU use, so the culprit rises to the top of the list. ps aux lists the same processes but only as a one-time snapshot, and df -h reports disk space rather than processes.",
  },
  {
    id: "linux-p6",
    skillId: "linux",
    topicId: "linux-processes",
    prompt:
      "`systemctl status myapp` shows the service as failed, but only prints its last few log lines. On a systemd-based server, which command shows the full log output of that one service?",
    options: [
      "journalctl -u myapp",
      "systemctl daemon-reload",
      "systemctl enable myapp",
      "top -u myapp",
    ],
    answer: 0,
    explanation:
      "systemd collects each unit's output in the journal, and journalctl -u filters it to a single service so you can read the whole failure. daemon-reload only re-reads unit files after you edit them; it shows no logs.",
  },
  {
    id: "linux-p7",
    skillId: "linux",
    topicId: "linux-scripting",
    prompt:
      "You want to know how many lines in app.log contain the text ERROR. Which command gives you that number directly?",
    options: ["wc -l app.log", "grep -c ERROR app.log", "cat app.log | tail -n 100", "ls -l app.log"],
    answer: 1,
    explanation:
      "grep -c prints the number of lines that match the pattern instead of the lines themselves. wc -l counts every line in the file, matching or not, so it answers a different question.",
  },
  {
    id: "linux-p8",
    skillId: "linux",
    topicId: "linux-scripting",
    prompt:
      "A scheduled job runs `./backup.sh > backup.log`. One night the backup fails, but backup.log is empty and the error messages are nowhere in the file. Why?",
    options: [
      "The script must be run with sudo before `>` can write to a file",
      "`>` only works for commands typed interactively, not for scheduled jobs",
      "`>` redirects standard output only; errors go to standard error, which needs `2>&1` to be captured too",
      "The shell discards error messages whenever output is redirected",
    ],
    answer: 2,
    explanation:
      "A program has two output streams: `>` captures standard output, while error messages are normally written to standard error. Adding `2>&1` after the redirect sends both streams to the file. Nothing was discarded; the errors simply went to wherever the job's standard error pointed, not into backup.log.",
  },

  // ───────── ci-cd ─────────
  {
    id: "ci-cd-p1",
    skillId: "ci-cd",
    topicId: "ci-cd-concepts",
    prompt:
      "A developer's tests pass on their laptop, but the CI pipeline fails on the very same commit. What is the right way to treat the CI failure?",
    options: [
      "Merge anyway, because the local run already proved the code works",
      "Treat it as real and find what differs between CI and the laptop",
      "Re-run the pipeline until it happens to pass",
      "Disable the failing test in CI and keep running it locally",
    ],
    answer: 1,
    explanation:
      "CI builds from a fresh checkout in a clean environment, so it catches things a laptop hides, such as a dependency installed by hand or a file that was never committed. Re-running until it goes green hides the difference instead of explaining it, and the same problem is then waiting in production.",
  },
  {
    id: "ci-cd-p2",
    skillId: "ci-cd",
    topicId: "ci-cd-concepts",
    prompt:
      "A commit merged this morning broke the build on main, and the pipeline has been red for three hours. Teammates keep merging new work on top of it. What does standard CI practice say to do?",
    options: [
      "Keep merging and fix everything together in the week before the release",
      "Turn the pipeline off until someone has time to investigate",
      "Have everyone branch from last week's commit instead",
      "Fix or revert the breaking commit right away so main is green again",
    ],
    answer: 3,
    explanation:
      "A red main branch blocks everyone: new failures hide behind the existing one and nobody can tell whether their own change is safe. Getting back to green quickly, usually by reverting, is the priority; saving the fixes for release week recreates the big, painful integration that CI exists to avoid.",
  },
  {
    id: "ci-cd-p3",
    skillId: "ci-cd",
    topicId: "ci-cd-pipeline-config",
    prompt:
      "A team wants a dependency security scan to run every night at 02:00, even on days when nobody pushes any code. Which kind of pipeline trigger do they need?",
    options: [
      "A scheduled (cron) trigger",
      "A push trigger on the main branch",
      "A pull request trigger",
      "A manual trigger started from the web interface",
    ],
    answer: 0,
    explanation:
      "A scheduled trigger starts the pipeline at fixed times regardless of repository activity. A push trigger only fires when commits arrive, so on a quiet day the scan would never run.",
  },
  {
    id: "ci-cd-p4",
    skillId: "ci-cd",
    topicId: "ci-cd-pipeline-config",
    prompt:
      "A library must be tested against Node.js 18, 20 and 22. The current workflow has one test job that uses Node 20. What is the cleanest way to cover all three versions?",
    options: [
      "Copy the whole workflow file three times and edit the version in each copy",
      "Test on Node 22 only, since newer versions include the older ones",
      "Define a build matrix so the same job runs once for each version",
      "Ask each developer to test the other versions on their laptop",
    ],
    answer: 2,
    explanation:
      "A matrix runs one job definition once per listed value, so there is a single place to maintain the steps. Three copied files would work on day one but drift apart as soon as someone edits only one of them.",
  },
  {
    id: "ci-cd-p5",
    skillId: "ci-cd",
    topicId: "ci-cd-testing-artifacts",
    prompt:
      "A workflow has a build job that creates a dist/ folder and a separate deploy job that runs after it. deploy fails because dist/ does not exist. What is the usual fix?",
    options: [
      "Commit the dist/ folder to the repository so every job can see it",
      "Give the deploy job a longer timeout",
      "Upload dist/ as an artifact in build and download it in deploy",
      "Run the build job twice so the folder is created again",
    ],
    answer: 2,
    explanation:
      "Each job normally starts on a fresh machine with a clean workspace, so files created in one job are not there in the next. Artifacts are how a pipeline passes build output between jobs; committing generated files would bloat the repository and let them go stale.",
  },
  {
    id: "ci-cd-p6",
    skillId: "ci-cd",
    topicId: "ci-cd-testing-artifacts",
    prompt:
      "One test fails roughly one run in ten, with no code changes in between. The team's habit is to click re-run until the pipeline goes green. What is the better response?",
    options: [
      "Treat it as flaky: find the cause, or quarantine it with a tracked ticket",
      "Keep re-running it, since a test that passes nine times in ten shows the code works",
      "Delete every test in that file",
      "Mark the whole test stage as allowed to fail",
    ],
    answer: 0,
    explanation:
      "A test that fails at random teaches the team to ignore red pipelines, and then real failures get re-run and merged too. Fixing or isolating the flaky test keeps the signal trustworthy; allowing the whole stage to fail throws away every other test's protection as well.",
  },
  {
    id: "ci-cd-p7",
    skillId: "ci-cd",
    topicId: "ci-cd-deployment",
    prompt:
      "An application runs on four servers. The pipeline does a rolling update: it replaces one server at a time and waits for that server's health check before moving on. The new version fails its health check on the first server. What happens?",
    options: [
      "All four servers are already running the new version, so the whole site is down",
      "The pipeline deletes the old version from every server before stopping",
      "Traffic is split evenly between the old and new versions until someone decides",
      "The rollout stops, and the other three servers keep serving the old version",
    ],
    answer: 3,
    explanation:
      "A rolling update changes a small part of the fleet at a time and uses health checks as a gate, so a bad version is caught while most capacity is still on the known-good one. That is the advantage over replacing every server at once, where the same failure would take the whole site down.",
  },
  {
    id: "ci-cd-p8",
    skillId: "ci-cd",
    topicId: "ci-cd-deployment",
    prompt:
      "A teammate accidentally commits a cloud API key and pushes it to the team's shared repository. They remove the line in a follow-up commit. What still needs to happen?",
    options: [
      "Nothing; the key is no longer in the latest version of the code",
      "The key must be revoked and replaced, because it is still readable in the Git history",
      "The repository should be renamed so the old commit is harder to find",
      "The pipeline should be paused until the next scheduled key rotation",
    ],
    answer: 1,
    explanation:
      "Deleting the line only changes the newest commit; the earlier commit, and every clone made in the meantime, still contains the key. The only safe assumption is that it has leaked, so revoke it and issue a new one that is kept out of the repository.",
  },

  // ───────── docker ─────────
  {
    id: "docker-p1",
    skillId: "docker",
    topicId: "docker-images",
    prompt:
      "You run `docker run -d nginx` three times in a row on a machine that already has the nginx image. What do you end up with?",
    options: [
      "Three separate containers created from one image",
      "Three copies of the nginx image, one for each run",
      "One container that has been restarted three times",
      "One container running three nginx images",
    ],
    answer: 0,
    explanation:
      "An image is a read-only template and a container is a running instance of it, so each `docker run` creates a new container from the same image. The image is not duplicated: the containers share its layers and each adds only a thin writable layer of its own.",
  },
  {
    id: "docker-p2",
    skillId: "docker",
    topicId: "docker-images",
    prompt:
      "`docker build .` sends a 2 GB build context, and `COPY . .` puts node_modules and the .git folder into the image. What is the standard fix?",
    options: [
      "Add --no-cache to the build command",
      "Delete the .git folder by hand before every build",
      "Add a .dockerignore file that lists both paths",
      "Move the Dockerfile into the node_modules folder",
    ],
    answer: 2,
    explanation:
      "A .dockerignore file excludes paths from the build context, so they are neither sent to the builder nor picked up by `COPY . .`. --no-cache makes things worse here: it forces every layer to rebuild and does nothing about the size of the context.",
  },
  {
    id: "docker-p3",
    skillId: "docker",
    topicId: "docker-containers",
    prompt:
      "A container named web is running but serving the wrong configuration. You want an interactive shell inside it to inspect its files. Which command gives you one?",
    options: ["docker logs --follow web", "docker inspect web", "docker run -it web sh", "docker exec -it web sh"],
    answer: 3,
    explanation:
      "docker exec starts an extra process, here a shell, inside a container that is already running. docker run -it web sh looks similar but treats web as an image name and tries to start a brand-new container, which is not the one you need to inspect.",
  },
  {
    id: "docker-p4",
    skillId: "docker",
    topicId: "docker-containers",
    prompt:
      "You run `docker stop api`, then `docker run -d --name api myimg`. Docker replies that the container name \"api\" is already in use. Why?",
    options: [
      "`docker stop` only pauses the container, so it is still running under that name",
      "The stopped container still exists until you run `docker rm api`",
      "A container name can be used only once for each image",
      "Docker keeps names reserved until the daemon is restarted",
    ],
    answer: 1,
    explanation:
      "Stopping a container ends its process but keeps the container, with its name, filesystem and logs, until it is removed. That is useful for inspecting a container after it exits, but it means the name stays taken until you run docker rm.",
  },
  {
    id: "docker-p5",
    skillId: "docker",
    topicId: "docker-networking-volumes",
    prompt:
      "During development you want edits to source files on your laptop to show up inside a running container straight away, without rebuilding the image. What do you use?",
    options: [
      "A named volume created with `docker volume create`",
      "A bind mount of the project directory, e.g. -v $(pwd):/app",
      "A published port, e.g. -p 3000:3000",
      "A `COPY . /app` line in the Dockerfile",
    ],
    answer: 1,
    explanation:
      "A bind mount maps a directory on the host into the container, so both sides see the same files as you edit them. COPY bakes a snapshot of the files into the image at build time, which is why later changes do not appear until you rebuild.",
  },
  {
    id: "docker-p6",
    skillId: "docker",
    topicId: "docker-networking-volumes",
    prompt:
      "A Dockerfile contains `EXPOSE 3000`. You start the container with `docker run -d myapp` and open http://localhost:3000 on the host, but the connection fails. The app inside is running normally. Why?",
    options: [
      "EXPOSE only works for ports below 1024",
      "The container must be restarted once before its ports become active",
      "Containers can never be reached from the host machine",
      "EXPOSE only documents the port; publishing it needs -p",
    ],
    answer: 3,
    explanation:
      "EXPOSE is metadata recording which port the application listens on; it does not open anything on the host. Publishing the port with -p when the container is started is what creates the mapping your browser needs.",
  },
  {
    id: "docker-p7",
    skillId: "docker",
    topicId: "docker-compose",
    prompt:
      "The db service in a compose file stores its data in a named volume. You run `docker compose down` and then `docker compose up -d`. What has happened to the database data?",
    options: [
      "It is gone, because `down` deletes everything the project created",
      "It is gone unless the containers were stopped one by one first",
      "It is still there: `down` removes containers and networks but keeps named volumes unless you add -v",
      "It is still there, but only until the host is rebooted",
    ],
    answer: 2,
    explanation:
      "docker compose down removes the project's containers and networks and leaves named volumes alone, so the data survives. Adding -v (or --volumes) is what deletes them, which is worth knowing before you run it on anything that matters.",
  },
  {
    id: "docker-p8",
    skillId: "docker",
    topicId: "docker-compose",
    prompt:
      "A compose file contains `image: postgres:${PG_VERSION}`. A file named .env in the same directory contains the line `PG_VERSION=16`. What happens when you run `docker compose up`?",
    options: [
      "Compose substitutes the value, so the image is postgres:16",
      "Compose fails, because variables are not allowed in a compose file",
      "The literal text ${PG_VERSION} is used as the image tag",
      "Compose ignores the file unless it is renamed to compose.env",
    ],
    answer: 0,
    explanation:
      "Compose reads a .env file in the project directory and uses it to fill in ${...} placeholders in the compose file. That substitution is separate from passing variables into the containers, which needs an environment or env_file entry on the service.",
  },

  // ───────── cloud-fundamentals ─────────
  {
    id: "cloud-fundamentals-p1",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-models",
    prompt:
      "A company stores customer documents in a cloud provider's object storage. An engineer changes the bucket's settings to allow public access, and the documents leak. Under the shared responsibility model, whose side of the line was this?",
    options: [
      "The provider's, because the data sat in the provider's data center",
      "The provider's, because object storage is a managed service",
      "Nobody's; public buckets are an unavoidable risk of using the cloud",
      "The customer's, because access settings on your data are your job",
    ],
    answer: 3,
    explanation:
      "The provider secures the infrastructure the service runs on, but the customer decides who may access their data and is responsible for those settings in every service model. Using a managed service moves hardware and software upkeep to the provider, not the choice of who gets in.",
  },
  {
    id: "cloud-fundamentals-p2",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-models",
    prompt:
      "Your team moves from running PostgreSQL on its own VM to a managed database service. Which of these tasks is still your team's responsibility afterwards?",
    options: [
      "Replacing failed disks in the database host",
      "Patching the operating system that runs underneath the database",
      "Designing the schema and deciding who can access the data",
      "Maintaining the data center's power and cooling",
    ],
    answer: 2,
    explanation:
      "A managed database hands the hardware, the operating system and the upkeep of the database software to the provider. What goes into the database and who is allowed to reach it remain yours, so schema design and access control do not go away.",
  },
  {
    id: "cloud-fundamentals-p3",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-compute-storage",
    prompt:
      "A piece of code must create a thumbnail each time a user uploads a photo. It runs for about two seconds, a few hundred times a day, at unpredictable moments. Which compute option fits best?",
    options: [
      "A serverless function triggered by the upload event",
      "A large VM that runs all day and night waiting for uploads",
      "A dedicated physical server rented by the month",
      "A fleet of VMs spread across three regions",
    ],
    answer: 0,
    explanation:
      "Serverless functions run only when an event arrives and are billed for the time they execute, which suits short, occasional work. A VM kept running all day would sit idle almost the entire time while still costing money.",
  },
  {
    id: "cloud-fundamentals-p4",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-compute-storage",
    prompt:
      "Three application VMs must read and write the same directory tree at the same time, using ordinary file paths. Which storage option is designed for that?",
    options: [
      "A separate block storage volume attached to each of the three VMs",
      "A managed network file share (for example Amazon EFS)",
      "Each VM's own instance-local disk",
      "An in-memory cache shared by the three VMs",
    ],
    answer: 1,
    explanation:
      "A network file share can be mounted by many machines at once and behaves like a normal filesystem for all of them. Separate block volumes would give each VM its own private disk, so a file written on one VM would not be visible on the others.",
  },
  {
    id: "cloud-fundamentals-p5",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-iam",
    prompt:
      "You have just created a new cloud account and are signed in as its root user. Which step best follows good practice?",
    options: [
      "Share the root password with the team so nobody is ever locked out",
      "Create access keys for the root user and use them in your scripts",
      "Enable MFA on root and create limited identities for daily work",
      "Keep using root for everything, since it never hits a permission problem",
    ],
    answer: 2,
    explanation:
      "The root user can do anything in the account, including closing it, so it should be protected with multi-factor authentication and used only for the few tasks that require it. Day-to-day work belongs to individual identities with limited permissions, which keeps mistakes small and makes every action traceable to a person.",
  },
  {
    id: "cloud-fundamentals-p6",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-iam",
    prompt:
      "A developer signs in to the cloud console without any problem, but clicking \"Start VM\" returns \"Access denied\". What is the most likely cause?",
    options: [
      "Their identity is authenticated but has no permission for that action",
      "Their password is wrong",
      "The provider's VM service is having an outage",
      "Their multi-factor device needs to be registered again",
    ],
    answer: 0,
    explanation:
      "Signing in proves who you are (authentication); each action is then checked against the permissions attached to that identity (authorization). A wrong password would have stopped the sign-in itself, so the fix here is to grant the specific permission, usually through a group or role.",
  },
  {
    id: "cloud-fundamentals-p7",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-scaling-cost",
    prompt:
      "A shop's traffic is ten times higher in the evening than overnight. It runs a fixed fleet of 20 VMs, sized for the evening peak, around the clock. What is the most appropriate improvement?",
    options: [
      "Replace the 20 VMs with one very large VM",
      "Use an autoscaling group that adds and removes instances as load changes",
      "Keep the fleet fixed and add 20 more VMs to be safe",
      "Move the fleet to a different region each night",
    ],
    answer: 1,
    explanation:
      "Autoscaling matches capacity to demand, so the fleet grows for the peak and shrinks when traffic drops, and you stop paying for idle machines. One huge VM costs the same all night and also becomes a single point of failure.",
  },
  {
    id: "cloud-fundamentals-p8",
    skillId: "cloud-fundamentals",
    topicId: "cloud-fundamentals-scaling-cost",
    prompt:
      "A student starts a GPU VM for an experiment, forgets about it, and finds a large bill three weeks later. Which guardrail would have caught this earliest?",
    options: [
      "A larger and faster VM, so that the experiment finishes much sooner",
      "A second account to split the charges",
      "A daily snapshot of the VM's disk",
      "A budget alert that fires when spending passes a set amount",
    ],
    answer: 3,
    explanation:
      "Budget or billing alerts send a notification once spending passes an amount you choose, turning a three-week surprise into a message within a day or two. Snapshots protect data, not money, and they add storage charges of their own.",
  },

  // ───────── networking ─────────
  {
    id: "networking-p1",
    skillId: "networking",
    topicId: "networking-ip-ports",
    prompt:
      "A laptop on an office Wi-Fi network has the address 192.168.1.42. A colleague working from home tries to connect to that address directly over the internet and cannot. Why?",
    options: [
      "The address is IPv6, and home connections only support IPv4",
      "192.168.x.x is a private range, not routed on the internet",
      "Addresses ending in .42 are reserved for routers",
      "The laptop must be restarted before it accepts outside connections",
    ],
    answer: 1,
    explanation:
      "The ranges 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 are private: they are reused inside countless networks, and internet routers do not forward them. Reaching that laptop from outside needs something in between, such as a VPN or a forwarding rule on the office router's public address.",
  },
  {
    id: "networking-p2",
    skillId: "networking",
    topicId: "networking-ip-ports",
    prompt:
      "You are writing firewall rules for a new Linux web server. Administrators connect over SSH and visitors use HTTPS, both on their default ports. Which two ports do you allow?",
    options: ["22 and 443", "21 and 80", "23 and 8080", "25 and 53"],
    answer: 0,
    explanation:
      "SSH listens on port 22 and HTTPS on port 443 by default. Port 80 is plain HTTP and 21 is FTP, so that pair would leave both of the services you need blocked.",
  },
  {
    id: "networking-p3",
    skillId: "networking",
    topicId: "networking-dns",
    prompt:
      "From an application server, `ping db.internal.example.com` fails with \"Name or service not known\", but `ping 10.0.3.7`, the database's IP address, gets replies. What is failing?",
    options: [
      "The database server is powered off",
      "A firewall between the two servers is blocking all traffic",
      "Name resolution: the hostname cannot be turned into an IP",
      "The network cable on the application server",
    ],
    answer: 2,
    explanation:
      "Replies from the IP address prove the network path and the server are fine. The error appears before any packet is sent, when the hostname cannot be looked up, so the things to check are the DNS record and the resolver the server is configured to use.",
  },
  {
    id: "networking-p4",
    skillId: "networking",
    topicId: "networking-dns",
    prompt:
      "On your own laptop you add this line to the hosts file (/etc/hosts):\n\n10.0.0.5 staging.example.com\n\nWhat changes?",
    options: [
      "Everyone on the internet now reaches 10.0.0.5 for that name",
      "The public DNS record for that name is updated to 10.0.0.5",
      "Nothing, because the hosts file is only read when the machine boots",
      "Only your laptop now resolves that name to 10.0.0.5",
    ],
    answer: 3,
    explanation:
      "The hosts file is a local lookup table that the operating system normally checks before asking DNS, so it overrides the answer on that one machine only. It never touches the real DNS records, which makes it handy for testing a new server before changing DNS for everyone.",
  },
  {
    id: "networking-p5",
    skillId: "networking",
    topicId: "networking-http-tls",
    prompt:
      "Right after a deploy, your monitoring shows a jump in \"500 Internal Server Error\" responses for requests that worked an hour ago. What does this class of status code tell you?",
    options: [
      "The server failed while handling the requests",
      "The clients are sending malformed requests",
      "The requested pages have moved to a new address",
      "The users are not logged in",
    ],
    answer: 0,
    explanation:
      "Codes in the 5xx range mean the request reached the server and the server failed to complete it, which points at the application or something it depends on. Client mistakes such as a malformed request or a missing page are reported with 4xx codes instead.",
  },
  {
    id: "networking-p6",
    skillId: "networking",
    topicId: "networking-http-tls",
    prompt:
      "Nothing was deployed overnight, yet this morning every browser shows a security warning for your site. You find that the site's TLS certificate expired at midnight. What is the fix?",
    options: [
      "Ask users to clear their browser cache",
      "Restart the web server so it loads the certificate again",
      "Install a renewed certificate, and automate renewal so it does not lapse again",
      "Switch the site from port 443 to port 8443",
    ],
    answer: 2,
    explanation:
      "Every certificate has an end date, and clients refuse to trust it after that moment no matter how the server is configured. Restarting changes nothing, because the server would present the same expired certificate; only a renewed one fixes it.",
  },
  {
    id: "networking-p7",
    skillId: "networking",
    topicId: "networking-load-balancing-troubleshooting",
    prompt:
      "An app keeps each user's login session in the memory of the server that handled the login. After a second server is added behind the load balancer, users are randomly asked to log in again. Why?",
    options: [
      "The load balancer strips cookies from every request for security reasons",
      "Two servers cannot share one domain name",
      "The second server needs a different TLS certificate",
      "Requests now reach a server that does not hold the user's session",
    ],
    answer: 3,
    explanation:
      "The load balancer spreads requests across both servers, so a user who logged in on one can land on the other, which knows nothing about them. The usual fix is to keep sessions in a shared store such as a database or cache; sticky sessions on the load balancer are a stopgap.",
  },
  {
    id: "networking-p8",
    skillId: "networking",
    topicId: "networking-load-balancing-troubleshooting",
    prompt:
      "Requests from your server to a partner's API hang and then time out. The hostname resolves correctly. You want to see how far along the network path your packets get. Which tool do you use?",
    options: ["dig", "traceroute", "df", "systemctl status"],
    answer: 1,
    explanation:
      "traceroute lists the router hops between you and the destination, so you can see roughly where replies stop coming back. dig only answers DNS questions, and the name already resolves, so it cannot tell you anything about the path.",
  },

  // ───────── iac ─────────
  {
    id: "iac-p1",
    skillId: "iac",
    topicId: "iac-concepts",
    prompt:
      "Production was built over two years by clicking through the cloud console, and nobody remembers every setting. The team now needs an identical staging environment. Which benefit of infrastructure as code addresses this most directly?",
    options: [
      "Cloud resources become cheaper when they are created from code",
      "Servers defined in code run faster than ones created in the console",
      "The environment is defined in versioned files and can be recreated",
      "The cloud console is disabled once code is in use",
    ],
    answer: 2,
    explanation:
      "When infrastructure is written down as code, the files are the full record of every setting, and running them again produces a matching environment. The resources cost and perform the same however they were created; what changes is repeatability and the history of who changed what.",
  },
  {
    id: "iac-p2",
    skillId: "iac",
    topicId: "iac-concepts",
    prompt:
      "A Terraform configuration manages a storage bucket that is no longer needed. You delete the bucket's resource block from the code and run `terraform apply`. What does Terraform propose?",
    options: [
      "Nothing, because removing code never affects real resources",
      "Destroying the bucket, since the code no longer declares it",
      "Keeping the bucket but renaming it to mark it as unmanaged",
      "Putting the resource block back into your code",
    ],
    answer: 1,
    explanation:
      "The configuration describes everything that should exist, so a resource Terraform manages that is missing from the code is planned for destruction. Deleting a few lines can therefore delete real infrastructure, which is exactly what you want here and a nasty surprise when it is done by accident.",
  },
  {
    id: "iac-p3",
    skillId: "iac",
    topicId: "iac-workflow",
    prompt:
      "You run `terraform plan`. It reports \"Plan: 2 to add, 0 to change, 0 to destroy\". You then close the terminal without running anything else. What has changed in your cloud account?",
    options: [
      "Two resources were created",
      "Two resources were created and will be removed again after a timeout",
      "Two resources are reserved and will be created by the next plan",
      "Nothing; plan only previews the changes that apply would make",
    ],
    answer: 3,
    explanation:
      "terraform plan compares the configuration with what exists and prints the difference without making any change. Resources are only created when you run terraform apply and confirm it.",
  },
  {
    id: "iac-p4",
    skillId: "iac",
    topicId: "iac-workflow",
    prompt:
      "Before opening a pull request you want a quick check that your Terraform files have no syntax errors or references to undeclared variables, without creating or changing anything. Which command is meant for this?",
    options: ["terraform validate", "terraform fmt", "terraform apply", "terraform state list"],
    answer: 0,
    explanation:
      "terraform validate checks that the configuration is syntactically valid and internally consistent, and it never touches real infrastructure. terraform fmt is the tempting alternative, but it only rewrites layout and would not notice a reference to a variable that does not exist.",
  },
  {
    id: "iac-p5",
    skillId: "iac",
    topicId: "iac-state",
    prompt:
      "A Terraform configuration creates a database with a password. Looking inside terraform.tfstate, you see the password in plain text. What is the right conclusion?",
    options: [
      "State can contain secrets, so keep it in an encrypted, access-controlled backend and out of Git",
      "State files are safe to share, because only Terraform can read them",
      "The password should be deleted from the state file by hand",
      "This is a bug, and running apply again will encrypt the value",
    ],
    answer: 0,
    explanation:
      "Terraform records resource attributes in state as readable JSON, sensitive ones included. The state file therefore needs the same protection as the secrets inside it; editing it by hand to remove values would break Terraform's record of the resource.",
  },
  {
    id: "iac-p6",
    skillId: "iac",
    topicId: "iac-state",
    prompt:
      "You run `terraform apply` and get \"Error acquiring the state lock\". The message shows that a colleague started an apply two minutes ago. What should you do?",
    options: [
      "Run `terraform force-unlock` straight away so you can continue",
      "Delete the remote state file and run apply again",
      "Wait for their run to finish, then run your plan again",
      "Copy the state to your laptop and apply from there",
    ],
    answer: 2,
    explanation:
      "The lock is doing its job: it stops two runs from writing the state at the same moment. Forcing it open while the other apply is still running risks corrupting the state; force-unlock is for a lock left behind by a run that has crashed.",
  },
  {
    id: "iac-p7",
    skillId: "iac",
    topicId: "iac-modules-variables",
    prompt:
      "A module called network creates a subnet. The root configuration needs that subnet's ID to place a VM in it. How does the ID get out of the module?",
    options: [
      "The root configuration reads the module's local values directly",
      "The module declares an output that the root configuration references",
      "The ID has to be copied by hand from the cloud console",
      "Every resource inside a module is automatically visible to the root configuration",
    ],
    answer: 1,
    explanation:
      "A module only exposes what it declares as outputs; its internal resources and local values are not reachable from outside. Declaring an output keeps the module's interface explicit, and Terraform also uses the reference to create the subnet before the VM.",
  },
  {
    id: "iac-p8",
    skillId: "iac",
    topicId: "iac-modules-variables",
    prompt:
      "Your configuration uses a network module from a public registry with no version specified. One morning `terraform init` on a fresh machine picks up a new major release, and the plan shows unexpected changes. How do you prevent this?",
    options: [
      "Stop using modules and paste the resources into your own files",
      "Run `terraform init` less often",
      "Delete the state file so the module starts fresh",
      "Pin the module to a specific version and upgrade it deliberately",
    ],
    answer: 3,
    explanation:
      "Without a version constraint, a fresh install takes the newest release, so the code you run can change without any commit in your repository. Pinning the version makes an upgrade a reviewed change; pasting the resources into your own files avoids the surprise but gives up the module's maintenance and reuse.",
  },

  // ───────── monitoring ─────────
  {
    id: "monitoring-p1",
    skillId: "monitoring",
    topicId: "monitoring-signals",
    prompt:
      "You want a graph of how many requests per second a service handled over the last 30 days, and an alert when that number drops sharply. Which signal is the best fit?",
    options: [
      "Distributed traces for every request",
      "Full debug logs kept for 30 days",
      "Screenshots of the application taken every minute",
      "Metrics: numeric measurements recorded over time",
    ],
    answer: 3,
    explanation:
      "Metrics are numbers sampled over time, so they are cheap to keep for long periods and easy to graph and alert on. You could count log lines to get the same figure, but storing and searching 30 days of detailed logs is far more expensive for a question that only needs a number.",
  },
  {
    id: "monitoring-p2",
    skillId: "monitoring",
    topicId: "monitoring-signals",
    prompt:
      "A metric shows payment failures spiked at 09:12. You now need the exact error message and the order that triggered it. Where do you look?",
    options: [
      "The CPU and memory graphs for the payment hosts",
      "The service's logs for that time window",
      "The uptime check history",
      "The monthly availability report",
    ],
    answer: 1,
    explanation:
      "Metrics tell you that something happened and when; logs record the individual events with their details, such as the error text and the order involved. A CPU graph is another aggregate number, so it cannot show what a specific failing request said.",
  },
  {
    id: "monitoring-p3",
    skillId: "monitoring",
    topicId: "monitoring-metrics-dashboards",
    prompt:
      "After a marketing campaign, a dashboard shows errors rising from 50 to 100 per minute. Requests rose from 5,000 to 10,000 per minute over the same period. Has the service become less reliable?",
    options: [
      "No: the error rate is still 1% of requests, so reliability is unchanged",
      "Yes: the number of errors doubled, so reliability halved",
      "Yes: any increase in errors means there is an outage",
      "It is impossible to say without looking at CPU usage",
    ],
    answer: 0,
    explanation:
      "Raw counts grow with traffic, so they need to be read as a ratio: 50 of 5,000 and 100 of 10,000 are both 1%. Graphing the error rate rather than the error count is what lets you tell a busier service from a broken one.",
  },
  {
    id: "monitoring-p4",
    skillId: "monitoring",
    topicId: "monitoring-metrics-dashboards",
    prompt:
      "A service dashboard has 40 graphs of host-level details. During an incident, the on-call engineer cannot tell at a glance whether users are affected. What should be at the top of the dashboard?",
    options: [
      "Per-host disk temperature and fan speed",
      "Every available metric from every host, sorted alphabetically by name",
      "User-facing indicators: request rate, error rate and latency",
      "The team's on-call rota",
    ],
    answer: 2,
    explanation:
      "The first question in an incident is whether users are hurting, and request rate, errors and latency answer it directly. Host-level graphs are still useful, but lower down, for finding the cause once you know there is a problem.",
  },
  {
    id: "monitoring-p5",
    skillId: "monitoring",
    topicId: "monitoring-alerting",
    prompt:
      "At its current growth, the disk on a log server will be full in about ten days. How should this condition be alerted?",
    options: [
      "As a page that wakes the on-call engineer immediately, at any hour",
      "As a ticket or low-urgency notice for working hours",
      "Not at all, since nothing is broken yet",
      "As an email to the whole company",
    ],
    answer: 1,
    explanation:
      "Urgency should match how soon someone must act: this needs attention within days, so a ticket is enough. Paging at 3 a.m. for something that can wait trains people to ignore pages, while no alert at all turns a slow problem into an outage ten days later.",
  },
  {
    id: "monitoring-p6",
    skillId: "monitoring",
    topicId: "monitoring-alerting",
    prompt:
      "A team's SLO is 99.9% successful requests per month. Two weeks in, a string of bad releases has used up the whole error budget. What is the usual agreed response?",
    options: [
      "Raise the SLO to 99.99% to encourage more care",
      "Stop measuring until next month",
      "Carry on releasing at the same pace, since the month is not over",
      "Slow down risky releases and prioritise reliability work",
    ],
    answer: 3,
    explanation:
      "The error budget is the amount of unreliability the team has agreed it can afford; once it is spent, further risk means missing the target users were promised. Shifting effort from features to stability is the standard response, whereas tightening the SLO just makes an already missed target harder to reach.",
  },
  {
    id: "monitoring-p7",
    skillId: "monitoring",
    topicId: "monitoring-incidents",
    prompt:
      "You are the junior engineer on call and get paged for an outage. After 15 minutes of following the runbook you still do not understand what is wrong, and users are still affected. What should you do?",
    options: [
      "Keep investigating alone for another hour so you do not disturb anyone",
      "Restart every server in the hope that it helps",
      "Escalate to the next person on call and share what you have checked",
      "Silence the alert and look again in the morning",
    ],
    answer: 2,
    explanation:
      "Escalating early is expected behaviour, not failure: the goal is to restore service for users, and a second person with more context shortens the outage. Struggling on alone feels considerate, but every extra minute is paid for by users.",
  },
  {
    id: "monitoring-p8",
    skillId: "monitoring",
    topicId: "monitoring-incidents",
    prompt:
      "Users in one country report errors, but the service's global error-rate graph looks normal. What is the most useful next step?",
    options: [
      "Break the error rate down by region to see whether one slice is failing",
      "Close the reports, because the dashboard shows no problem",
      "Restart the whole service worldwide",
      "Wait for the global graph to change before investigating",
    ],
    answer: 0,
    explanation:
      "A global average can hide a total failure in a small slice: if one region carries 2% of traffic, even 100% errors there barely moves the overall line. Splitting the metric by region, version or endpoint narrows down where the fault is, which is usually the fastest route to why.",
  },
];
