# Practice on KodeKloud

- [Some Courses on KodeKloud](#some-courses-on-kodekloud)
- [Pod](#pod)
- [ReplicaSets](#replicasets)
- [Label & Selector]()
- [Namespace](#namespace)
- [Deployment](#deployment)
- [Configmap](#configmap)
- [Secrets](#secrets)
- [Ingress](#ingress)

## Some Courses on KodeKloud

- Practice basic command on KodeKloud:
  - [Online Kubernetes Lab for Beginners - Hands On](https://uklabs.kodekloud.com/courses/labs-kubernetes-for-the-absolute-beginners-hands-on/)
  - [Certified Kubernetes Administrator with Practice Tests](https://uklabs.kodekloud.com/courses/labs-certified-kubernetes-administrator-with-practice-tests/)
  - [Certified Kubernetes Application Developer](https://uklabs.kodekloud.com/courses/labs-certified-kubernetes-application-developer)

*coupons in secret.txt*

## Pod

- Create a new pod with the **nginx** image:

> kubectl run nginx --image=nginx

- How many pods are created now?

> kubectl get pod

- What is the image used to create A pod?

> kubectl describe pod A | grep -i image

- Which nodes are these pods placed on?

> kubectl describe pod newpods-vkbm2 | grep -i node

> kubectl get pod -o wide

- Delete the webapp Pod.

> kubectl delete pod webapp

- Create a new pod with the name redis and the image redis123.

> kubectl run redis --image=redis123

## ReplicaSets

- How many ReplicaSets exist on the system?

> kubectl get replicaset --no-headers | wc -l

- What is the image used to create the pods in the new-replica-set?

> kubectl describe replicaset | grep -i image

- Create a ReplicaSet using the **replicaset-definition-1.yaml**

- You can check for apiVersion of replicaset by command

> kubectl api-resources | grep replicaset

```sh
controlplane ~ ➜  cat replicaset-definition-1.yaml 
apiVersion:apps/v1
kind: ReplicaSet
metadata:
  name: replicaset-1
spec:
  replicas: 2
  selector:
    matchLabels:
      tier: frontend
  template:
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: nginx
        image: nginx

controlplane ~ ➜  kubectl apply -f replicaset-definition-1.yaml 
replicaset.apps/replicaset-1 created

```

- Delete the ReplicaSets:

> kubectl delete replicaset **replicaset-name**

> kubectl delete -f **file-name**.yaml

- Fix the original replica set **new-replica-set** to use the correct **busybox** image.
  - Modify the image name and then save the file.
    > kubectl edit replicaset new-replica-set
  - Then, delete the previous pods to get the new ones with the correct image.

- Scale the ReplicaSet to 5 PODs.
  - Modify the replicas and then save the file
    > kubectl edit replicaset new-replica-set
  - Or:
    > kubectl scale rs new-replica-set --replicas=5

## Label & Selector

- How many PODs exist in the dev environment (env)?

> kubectl get pod --selector env=dev --all-namespaces

> kubectl get pod --selector env=dev --all-namespaces --no-headers | wc -l

- How many objects are in the prod environment including PODs, ReplicaSets and any other objects?

> kubectl get all --selector env=prod --all-namespaces --no-headers | wc -l

- Identify the POD which is part of the prod environment, the finance BU and of frontend tier?

> kubectl get pod --selector env=prod,bu=finance,tier=frontend --all-namespaces

## Namespace

- How many Namespaces exist on the system? *namespace === ns*

> kubectl get namespaces --no-headers | wc -l

- How many pods exist in the research namespace?

> kubectl get pod -n research --no-headers | wc -l

- Create a POD in the finance namespace.

> kubectl run redis --image=redis -n finance

- Which namespace has the blue pod in it?

> kubectl get all --all-namespaces | grep pod | grep blue

- What DNS name should the Blue application use to access the database **db-service** in the **dev** namespace?*khác namespace*.

```sh
controlplane ~ ➜  kubectl get pod --all-namespaces | grep blue
marketing       blue                                      1/1     Running            0             6m44s

controlplane ~ ➜  kubectl get all --all-namespaces | grep db-service
marketing       service/db-service        NodePort       10.43.217.112   <none>         6379:32186/TCP               7m
dev             service/db-service        ClusterIP      10.43.216.191   <none>         6379/TCP                     7m
```

- Ta dùng 1 trong 2 domain sau:
  - ***db-service.dev.svc.cluster.local***
  - ***db-service.dev***

## Deployment

- How many Deployments exist on the system?

> kubectl get deployment

## Configmap

- What is the environment variable name set on the container in the pod?

> kubectl get pod webapp-color -o yaml

> kubectl describe pod webapp-color

- Update the environment variable on the POD to display a green background. *Khi pod đang running thì không thể edit để thay đổi các thông tin như env variable,... chỉ có thể thay đổi image*
  - Ta sẽ tiến hành ghi cái file config sang file mới và edit thông tin mong muốn
    > kubectl get pod webapp-color -o yaml > webapp.yaml
  - Sau đó xóa pod cũ => apply file yaml mới
    > kubectl apply -f webapp.yaml

- How many ConfigMaps exists in the default namespace?

> kubectl get configmaps

- Identify the database host from the config map db-config.

> kubectl describe configmaps db-config

> kubectl get configmaps db-config -o yaml

- Create a new ConfigMap for the webapp-color POD. Use the spec given below.
  - ConfigMap Name: **webapp-config-map**
  - Data: **APP_COLOR=darkblue**
  - Data: **APP_OTHER=disregard**

> kubectl create configmap  webapp-config-map --from-literal=APP_COLOR=darkblue --from-literal=APP_OTHER=disregard

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webapp-config-map
data:
  APP_COLOR: darkblue
  APP_OTHER: disregard

```

- Convert from non configmap => configmap

```yaml
- env:
    - name: APP_COLOR
      value: green
```

```yaml
- env:
    - name: APP_COLOR
      valueFrom:
        configMapKeyRef: 
          name: webapp-config-map
          key: APP_COLOR

```

## Secrets

- How many Secrets exist on the system?

> kubectl get secrets

- How many secrets are defined in the dashboard-token secret?

> kubectl get secrets dashboard-token -o yaml

- Create a new secret named *db-secret* with the data given below.
  - Secret Name: *db-secret*
  - Secret 1: *DB_Host=sql01*
  - Secret 2: *DB_User=root*
  - Secret 3: *DB_Password=password123*

**Method 1:**
  > kubectl create secret generic db-secret --from-literal=DB_Host=sql01 --from-literal=DB_User=root --from-literal=DB_Password=password123

**Method 2:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: opaque
stringData: # k8s auto encode data để lưu trữ trong secret mà không cần encode Base64 trước.
  DB_Host: sql01
  DB_User: root
  DB_Password: password123
```

**Method 3:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: opaque
data: 
  DB_Host: # encode Base64
  DB_User: # encode Base64
  DB_Password: # encode Base64

```

- Configure webapp-pod to load environment variables from the newly created secret.

```yaml
spec:
  containers:
  - image: kodekloud/simple-webapp-mysql
    imagePullPolicy: Always
    name: webapp
    envFrom: # add
    - secretRef: # add
        name: db-secret # add

```

## Ingress

- Let us now deploy an Ingress Controller.

  - First, create a namespace called ingress-nginx.
  > kubectl create namespace ingress-nginx
  - The NGINX Ingress Controller requires a ConfigMap object. Create a ConfigMap object with name ingress-nginx-controller in the ingress-nginx namespace.
  > kubectl create configmap ingress-nginx-controller --namespace ingress-nginx
  - The NGINX Ingress Controller requires two ServiceAccounts. Create both ServiceAccount with name ingress-nginx and ingress-nginx-admission in the ingress-nginx namespace.
  > kubectl create serviceaccount ingress-nginx --namespace ingress-nginx
  
  >kubectl create serviceaccount ingress-nginx-admission --namespace ingress-nginx
  - Create the ingress resource to make the applications available at /wear and /watch on the Ingress service. Also, make use of rewrite-target annotation field: **nginx.ingress.kubernetes.io/rewrite-target: /**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-wear-watch
  namespace: app-space
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - http:
      paths:
      - path: /wear
        pathType: Prefix
        backend:
          service:
           name: wear-service
           port: 
            number: 8080
      - path: /watch
        pathType: Prefix
        backend:
          service:
           name: video-service
           port:
            number: 8080

```

*Ví dụ: Nếu Ingress có nginx.ingress.kubernetes.io/rewrite-target: /app, mọi yêu cầu đến /wear sẽ được rewrite thành /app/wear trước khi được chuyển đến service wear-service.*
