---
thumbnail: /assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/radicale_addressbook_added.png
tags: ["Server", "Sync"]
references: ["https://radicale.org/v3.html", "https://packages.debian.org/search?searchon=contents&keywords=htpasswd&mode=path&suite=stable&arch=any"]
---

Having to manage contacts and calendars separately from different devices is a pain in the ass, let's see how to synchronize them.

<!--more-->

## Radicale installation and configuration

To sync the contacts and calendars, we can use radicale, a CalDAV and CardDAV server. I'm going to install it on my Linux pc. I'm using a distribution based on Debian, so I can install it with apt:

```
sudo apt install radicale
```

Before continuing, we need to configure authentication. Radicale recommends using htpasswd. So that's what I'm going to use. If not already installed, we can install it along other utilities with the apache2-utils package:

```
sudo apt install apache2-utils
```

With this package installed, we can use `htpasswd` to create a username and password:

```
sudo htpasswd -c /etc/radicale/users mateu
```

We introduce the password and the file is generated with a content similar to this:

```
mateu:$apr1$DaQTZyg1$Laa3fwIqi/0dMLcCZlBG5.
```

The password is hashed for more security.

Now we need to configure radicale to use the file we created to authenticate users. Open the configuration file, located at `/etc/radicale/config`, with your favorite text editor, go to the auth section and change the `type` to `htpasswd` and the `htpasswd_filename` to the path to the generated file. Since we are here, let's change the hosts too. Now, it's only listening on localhost, we want other devices to reach the server, so we must change it. Put you host on the `hosts` property of the server section.

```conf
[server]

# CalDAV server hostnames separated by a comma
# IPv4 syntax: address:port
# IPv6 syntax: [address]:port
# For example: 0.0.0.0:9999, [::]:9999
hosts = 192.168.10.171:5232

# ...

[auth]

# Authentication method
# Value: none | htpasswd | remote_user | http_x_remote_user
type = htpasswd

# Htpasswd filename
htpasswd_filename = /etc/radicale/users
```

With all the configuration done, let's start the server. We use systemctl to enable it, so it will start automatically when we boot up, and start so it will execute right now:

```
sudo systemctl enable radicale
sudo systemctl start radicale
```

With that, radicale is executing. We enter the web interface going to the address specified previously on the `hosts` property. I get this error:

![Radicale web error](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/radicale_web_error.png)

After checking the logs using `sudo journalctl -f -u radicale`, I came across this error message: "[ERROR] An exception occurred during GET request on '/.web/': [Errno 13] Permission denied: '/var/lib/radicale/collections/.Radicale.lock'". After some searching I found a solution on [this](https://unix.stackexchange.com/questions/602596/systemd-linux-readwritepaths-not-working) Stack Overflow question. Adding `StateDirectory=radicale` to the service file located on `` fixed it:

```config
[Service]
# ...
StateDirectory=radicale
```

Now I can access the web interface:

![Radicale login page](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/radicale_login_page.png)

We enter the user and password previously configured and we are inside:

![Radicale collections page](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/radicale_web_collections_page.png)

We have 2 options:

- Create a new addressbook or calendar
- Or upload a file.

I'm going to choose the second option and load a file I exported from Thunderbird:

![Radicale addressbook added](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/radicale_addressbook_added.png)

## Sync with Thunderbird

At the bottom of the last screenshot we can see the url of the address book. We can use this url to add the address book to Thunderbird. On Thunderbird, go to the address book and click 'Add CardDAV Address Book'. Enter the url and the password when asked and you will be able to load the address book:

![Thunderbird add address book](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/thunderbird_add_addressbook.png)

## Sync with Android

To sync with android, we can use the DAVx⁵ app, it can be installed from F-Droid [here](https://f-droid.org/packages/at.bitfire.davdroid/). Select 'Add account' and 'Login with URL and user name'. Fill the fields and click 'Login'. If all the information you entered is correct, the connection will be successful.

![DAVx⁵ add account](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/davx5_add_account.png)
![DAVx⁵ addressbook](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/davx5_addressbook.png)

To sync the addressbook, click the checkbox. On the next sync, DAVx⁵ will load the addressbook to your phone. If you want to sync right now click the 'Synchronize now' button.

![DAVx⁵ sync](/assets/images/linux/sync_contacts_and_calendars_between_android_and_pc/davx5_sync.png)

## Adding contacts

To add contacts, you can just add them from Thunderbird or you contacts app on Android, make sure to add them to the new address book on Radicale. After a while, the contact will appear on all the clients connected to the Radicale server.

## Calendars

The proces to add calendars is almost the same, add or create a calendar on the radicale web ui and sync it using Thunderbird and DAVx⁵.