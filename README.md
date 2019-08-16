# Orion
[ ![Codeship Status for parkenergy/Orion](https://app.codeship.com/projects/20ffebf0-bb31-0134-1980-1216d6335015/status?branch=master)](https://app.codeship.com/projects/195602)

# CODESHIP
You will need someone to add you to the codeship projects so you can see the process of codeship and any 
configuration settings you want to set up with our CI/CD integration with them. Currently DJ is now an admin and can 
add you.


# Getting Started from scratch on mac

Make sure you have `homebrew`, `yarn`, `git`, and xcode installed before you get started. Make sure your mac is up to
 date as well.
 
 
Be careful with your edits and commits. Each commit to master is deployed. Even if its a change to the README.
 
#### Install Xcode from Apple Store
> this will also install git

#### Install Homebrew
```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
```

#### Install ansible

```bash
brew update
brew install ansible
ansible --version
``` 

#### Install Vagrant from Hashicorp

[Vagrant](https://www.vagrantup.com/downloads.html)

```bash
vagrant --version
```

#### Install Virtual Box from Oracle
 
To Install on current versions of mac there is a current issue instaling virtualbox on mac bc of mac blocking oracle 
for some reason. So allow oracle
> Restart your mac in Recovery mode (cmd + R)
  Then open a Terminal and enter : `spctl kext-consent add VB5E2TV963`
  Restart your mac.
  VB5E2TV963 is the code for oracle.
  It's ok for me with Mojave and Virtual Box 6.
  [forum](https://forums.virtualbox.org/viewtopic.php?f=8&t=84092&start=90)

[Select OS X hosts](https://www.virtualbox.org/wiki/Downloads)


Depending on where you want your Park Energy work projets to be simply make a work directory to drop all work 
projects in.

```bash
cd ~
mkdir work
cd work
```

Once you are in the work directory clone this repo

```bash
git clone https://github.com/parkenergy/Orion.git
```
You will be prompted to enter your github username and password. If you don't want to worry about putting in your 
username and password every time you can lookup how to set them on the system.

#### Now that Orion is installed get it running
In the file `/Orion/provisioning/devBox.yml` there are the settings for ansible, where I set the node version to 8.0.
 This is because the role `lifeofguenter.nodejs` is downloaded from `ansible-galaxy` which has roles used for things 
 like this. 8.0 is the current version that is supported. The server is running ubuntu 14.04. 
 
[lifeofguenter.nodejs](https://galaxy.ansible.com/lifeofguenter/nodejs) Download

```bash
ansible-galaxy install lifeofguenter.nodejs
```

Make sure you are in the Orion directory and then start up vagrant
```bash
vagrant up
```
> You will get en error about mongodb not installing this is how you fix it. Once you have ran the vagrant up it 
should of tried to provision. You will see a bunch of "TASK [mongodb : Install Mongodb] ******" items. The mongodb 
one will fail
 ```bash
 vagrant ssh
 sudo apt-get update
 sudo apt-get install -y mongodb-org --force-yes
 ```

After that you will need to run provisioning again to finish installing the other items
```bash
vagrant provision
```
Once that is done do you will need to create an RSA key to add to the mongodb server so that this local machine can 
copy the contents of the server so you can develop on it. 
```bash
vagrant ssh
ssh-keygen -m PEM -t rsa -b 4096 -C "put a very unique name here that says vagrant"
```
You will need to add a custom name because there are many other connections to the server besides this vagrant box.

Once you have this you will need to copy your id_rsa.pub key and add it to the mongodb server on aws. The `.ssh` 
directory is on the directory of entry when you `vagrant ssh`

#### Now to get this key added to the mongodb server.

You will need to fallow these steps
* connect to mongodb server `ssh access@54.187.140.31`
    > if you do not have access to the server because you have not been given access then someone with access will 
    have to add your vagrant pub key for you and your local machine's key if you have not 

Once you are in you will need to have your public key coppied. These steps will also need to be done if you want to 
add your computer to access to the server as well.

on Server
```bash
cd .ssh
vim authorized_keys
```
Once you are in vim move to the bottom of the file via the arrow keys. Then press `i` to set vim to insert and then 
paste your keys. Once you are done press `esc` then type `:qw` which will exit out and save.
> If you made changes but do not want to save them hit `esc` and type `:q!` which will exit the file without saving.

Once you have added the key to the authorized key you can now sync the remote db to your local db for 
testing/development.

#### Getting back to development setup
Now that you have the ssh key of your vagrant box in the mongo server you can sync

In vagrant
```bash
cd /vagrant
./syncDevDB.sh
```

This will ask to add ECDSA key fingerprint, hit yes. It might take two tries. I got a failed attempt the first try 
and success the second.

Now start up the app while still in the `/vagrant` directory you `cd` into in the previous step
```bash
gulp | bunyan
```
You will see a bunch of logs come out and once you see `App Started (port=3000)` you can now go to your browser and 
type in `localhost:3000` to see the site.

Currenlty the hot reloading after changes does not work properly and the app needs to be destroyed and started up 
again to see changes. `ctrl c` then `gulp | bunyan` again.

# Checking logs of the production server
> If you have not added your computers id_rsa.pub key(not the vagrant rsa key) to the Orion server(not the mongo 
server) you will need to add your ssh key to the authorized_keys of that server as well.

login
```bash
ssh ubuntu@54.187.66.137
```

Get the running tail of the Orion logger This will
show Only the logs produced by the `log` module on the back end.
```bash
tail -f orion.log | bunyan
```

Get the last # of lines of code which will include even console logs
```bash
tail -n 10000 orion.log
```


### Servier Issues 
If the server bounces and the iptables get jacked up

```bash
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
```


# Run Tests
Tests are no longer maintained or updated. Time per release was more important than tests.

```bash
yarn test --no-cache
```


