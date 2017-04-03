# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.box = "ubuntu/trusty64"

  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 1337, host: 1337
  config.vm.network "forwarded_port", guest: 27017, host: 27017

  config.vm.provider "virtualbox" do |vb|
    vb.name = "backoffice"
    vb.memory = "1024"
    vb.cpus = 1
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize ["modifyvm", :id, "--ioapic", "on"]
  end

  config.vm.hostname = "backoffice"
  config.vm.network :private_network, ip: "192.168.33.27"
  config.vm.define :orionBackoffice do |orionBackoffice|
  end

  config.vm.provision "ansible" do |ansible|
     ansible.playbook = "provisioning/devBox.yml"
     ansible.inventory_path = "provisioning/inventory"
     ansible.sudo = true
  end

end
