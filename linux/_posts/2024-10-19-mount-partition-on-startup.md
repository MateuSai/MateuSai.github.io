---
post_id: mount-partition-on-startup
---

To automatically mount a partition on startup we need to add a line to the fstab file. But first we need the UUID of the partition.

To view all the block devices use the `lsblk` command:

<!--more-->

{% highlight console %}
[~]$ lsblk
...
nvme0n1       259:0    0 476.9G  0 disk  
├─nvme0n1p1   259:1    0   300M  0 part  
├─nvme0n1p2   259:2    0 460.1G  0 part
└─nvme0n1p3   259:3    0  16.5G  0 part  
nvme1n1       259:4    0 476.9G  0 disk  
├─nvme1n1p1   259:5    0  1022M  0 part  /boot/efi
├─nvme1n1p2   259:6    0     4G  0 part  /recovery
├─nvme1n1p3   259:7    0 467.9G  0 part  /
└─nvme1n1p4   259:8    0     4G  0 part  
  └─cryptswap 252:0    0     4G  0 crypt [SWAP]
{% endhighlight %}

The partition I want to mount is nvme0n1p2, it has 460G, and because his last column does not contain a path, we know it's not mounted.

We can check the UUID using the `blkid` command with grep to show only the line that interests us:

{% highlight console %}
[23ms][~]$ sudo blkid | grep nvme0n1p2
[sudo] password for mateus: 
/dev/nvme0n1p2: LABEL="Games" UUID="0ba5e70e-bfd0-486d-8ea5-5558335f2454" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="e4dc54cb-9dde-4126-b262-37a3ebdf8f3d"
{% endhighlight %}

Now, open (with root privileges) `/etc/fstab` with your favorite text editor and add a line for the partition:

{% highlight console %}
# <file system>  <mount point>  <type>  <options>  <dump>  <pass>
PARTUUID=4397a2a7-9563-4c65-9b64-6019f31e26ac   /boot/efi            vfat   umask=0077                  0 0 
PARTUUID=72fc8231-7e67-4ac0-bec8-2ecbfcce1dfc   /recovery            vfat   umask=0077                  0 0 
UUID=eaf490d9-bcc4-43db-aeb2-6579cf6c33ff       /                    ext4   noatime,errors=remount-ro   0 1 
/dev/mapper/cryptswap                           none                 swap   defaults                    0 0 
UUID=0ba5e70e-bfd0-486d-8ea5-5558335f2454       /home/mateus/Games   ext4   defaults                    0 2
{% endhighlight %}

- In the first column we specify the UUID.

- In the second the path where we want to mount the partition.

- In the third the file system type, ext4 in this case.

- In the fourth some options, we can leave it at "defaults" if we don't want anything special. All the options available can be viewed [here](https://wiki.debian.org/fstab#line-33).

- The fifth column is used to make backups, with a 0 we disable it.

- Finally, the last column determines the mount order. This is important. In my case I want to mount the partition to '/home/mateus/Games', but this path is inside '/', mounted by the third entry in fstab. To make the new partition mount **after** the root partition '/', the value in this last column must be bigger. Thats why I put a 1 on the '/' partition and a '2' on the new one.

That's it, next time you boot the computer, the new partition will be mounted automatically.

## References
- [https://wiki.debian.org/fstab](https://wiki.debian.org/fstab)
- [https://www.redhat.com/en/blog/etc-fstab](https://www.redhat.com/en/blog/etc-fstab)