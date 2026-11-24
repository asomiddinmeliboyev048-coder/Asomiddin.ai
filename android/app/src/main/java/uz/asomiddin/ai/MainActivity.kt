package uz.asomiddin.ai

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    private val permissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val requested = mutableListOf(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= 33) requested += Manifest.permission.POST_NOTIFICATIONS
        permissions.launch(requested.toTypedArray())
        setContent { AsomiddinHome() }
    }
}

@Composable
private fun AsomiddinHome() {
    val bg = Color(0xFF080A12)
    var voiceEnabled by remember { mutableStateOf(false) }
    MaterialTheme(colorScheme = darkColorScheme(primary = Color(0xFFA78BFA), background = bg, surface = Color(0xFF17172A))) {
        Column(
            modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF21183D), bg))).verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Column { Text("ASOMIDDIN AI", fontSize = 21.sp, fontWeight = FontWeight.Black); Text("Shaxsiy AI yordamching", color = Color.LightGray, fontSize = 12.sp) }
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFFA78BFA), modifier = Modifier.size(30.dp))
            }
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF19172D)), shape = RoundedCornerShape(24.dp)) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Assalomu alaykum!", fontSize = 25.sp, fontWeight = FontWeight.Bold)
                    Text("Bugungi o‘qish rejangiz va vazifalaringiz shu yerda jamlanadi.", color = Color.LightGray)
                    Button(onClick = { voiceEnabled = !voiceEnabled }, modifier = Modifier.fillMaxWidth()) {
                        Icon(if (voiceEnabled) Icons.Default.Stop else Icons.Default.Mic, contentDescription = null)
                        Spacer(Modifier.width(8.dp)); Text(if (voiceEnabled) "Suhbatni to‘xtatish" else "Ovozli AI interfeysi")
                    }
                    Text(if (voiceEnabled) "Ovozli modul hali server provayderiga ulanmagan." else "Mikrofon faqat siz tugmani bosganingizda ishlatiladi.", color = Color(0xFFBDB4D8), fontSize = 12.sp)
                }
            }
            FeatureCard(Icons.Default.School, "TATU LMS", "Topshiriqlar, baholar va deadline’lar")
            FeatureCard(Icons.Default.CalendarMonth, "Kun tartibi", "Darslar, uchrashuvlar va eslatmalar")
            FeatureCard(Icons.Default.Call, "Qo‘ng‘iroqlar kotibi", "AI suhbat xulosalari va qayta qo‘ng‘iroqlar")
            FeatureCard(Icons.Default.NotificationsActive, "Aqlli eslatmalar", "Vaqtida bildirishnoma va kunlik hisobot")
            Text("Dastlabki Android interfeysi · Server integratsiyasi keyingi bosqichda", color = Color.Gray, fontSize = 11.sp)
        }
    }
}

@Composable
private fun FeatureCard(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, subtitle: String) {
    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF151B2B)), shape = RoundedCornerShape(18.dp)) {
        Row(Modifier.fillMaxWidth().padding(17.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = Color(0xFFA78BFA), modifier = Modifier.size(27.dp))
            Spacer(Modifier.width(14.dp))
            Column { Text(title, fontWeight = FontWeight.SemiBold); Text(subtitle, color = Color.LightGray, fontSize = 12.sp) }
        }
    }
}
