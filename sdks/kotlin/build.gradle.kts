plugins { kotlin("jvm") version "2.4.21" }
repositories { mavenCentral() }
dependencies { implementation("org.bouncycastle:bcprov-jdk18on:1.87"); implementation("org.json:json:20260814") }
kotlin { jvmToolchain(21) }
